import React, { useEffect, useState, useRef } from 'react';
import {
  Box,
  Paper,
  TextField,
  IconButton,
  Typography,
  Divider,
  CircularProgress,
  Chip,
  useTheme,
} from '@mui/material';
import {
  Send as SendIcon,
  Lock as LockIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import api from '../services/api';
import useMessages from '../hooks/useMessages';
import type { MessageDTO } from '../types/api';
import useSocket from '../hooks/useSocket';
import RolePill from './RolePill';
import {
  ensureLocalKeypair,
  getLocalPublicKeyBase64,
  importPublicKeyRaw,
  deriveAesKey,
  encryptText,
  decryptText,
} from '../utils/e2ee';

// Message shape is defined in types/api.ts (MessageDTO)

interface SecureChatProps {
  caseId: string;
  currentUserId: string;
  currentUserRole: 'client' | 'detective' | 'admin';
}

const SecureChat: React.FC<SecureChatProps> = ({ caseId, currentUserId }) => {
  const [newMessage, setNewMessage] = useState('');
  // local loading flags not needed; message list loading comes from useMessages
  const [sending, setSending] = useState(false);
  const [localKeys, setLocalKeys] = useState<{
    publicKey?: CryptoKey;
    privateKey?: CryptoKey;
  } | null>(null);
  const [participantKeys, setParticipantKeys] = useState<Record<string, string>>({}); // userId -> publicKeyBase64
  const importedKeyCache = useRef<Record<string, CryptoKey>>({});
  const localKeysRef = useRef<typeof localKeys | null>(null);
  const participantKeysRef = useRef<typeof participantKeys>({});
  const currentUserIdRef = useRef<string>(currentUserId);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const theme = useTheme();
  // socket managed by useSocket hook
  const { on } = useSocket(caseId);
  const DEBUG_E2EE = (import.meta as any).env?.VITE_DEBUG_E2EE === 'true' || false;

  // Use centralized messages hook
  const { messages, isLoading: messagesLoading, appendMessage } = useMessages(caseId);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    // 초기 메시지 로딩은 useMessages 훅이 담당합니다

    // Ensure local E2EE keypair and register public key with server (PoC)
    (async () => {
      try {
        const kp = await ensureLocalKeypair();
        if (DEBUG_E2EE) console.debug('[E2EE] ensured local keypair', kp);
        setLocalKeys({ publicKey: kp.publicKey, privateKey: kp.privateKey });
        const pub = getLocalPublicKeyBase64();
        if (pub) {
          await api.post('/e2ee/keys', { publicKey: pub }).catch(() => null);
          if (DEBUG_E2EE)
            console.debug('[E2EE] registered public key with server (base64 len=', pub.length, ')');
        }

        try {
          if (DEBUG_E2EE) console.debug('[E2EE] fetching participant public keys for case', caseId);
          const res = await api.get(`/e2ee/keys?caseId=${caseId}`);
          const keys: Array<{ userId: string; publicKey: string }> = res.data.keys || [];
          const map: Record<string, string> = {};
          for (const k of keys) map[k.userId] = k.publicKey;
          setParticipantKeys(map);
          if (DEBUG_E2EE) console.debug('[E2EE] fetched participant keys', Object.keys(map));
        } catch (err) {
          if (DEBUG_E2EE) console.warn('[E2EE] failed to fetch participant keys', err);
        }
      } catch (e) {
        // ignore
      }
    })();

    // Socket event subscription done via useSocket.on
    let offFn: (() => void) | undefined;
    try {
      offFn = on('chat:message', async (msg: MessageDTO) => {
        if (msg.caseId === caseId) {
          if (DEBUG_E2EE)
            console.debug('[E2EE] socket received chat:message', {
              id: msg.id,
              senderId: msg.senderId,
              encrypted: msg.encrypted,
            });
          const lk = localKeysRef.current;
          const pkMap = participantKeysRef.current;
          const currentUid = currentUserIdRef.current;
          if (msg.encrypted && msg.recipients && lk?.privateKey) {
            const entry = msg.recipients.find((r) => r.userId === currentUid);
            if (entry) {
              try {
                const senderPubB64 = pkMap[msg.senderId];
                if (senderPubB64) {
                  if (DEBUG_E2EE)
                    console.debug('[E2EE] attempting decryption for recipient entry', {
                      iv: entry.iv,
                      ciphertextLen: entry.ciphertext?.length,
                    });
                  let senderPub = importedKeyCache.current[msg.senderId];
                  if (!senderPub) {
                    senderPub = await importPublicKeyRaw(senderPubB64);
                    importedKeyCache.current[msg.senderId] = senderPub;
                  }
                  const aes = await deriveAesKey(lk.privateKey, senderPub);
                  const plain = await decryptText(aes, entry.iv || '', entry.ciphertext);
                  if (DEBUG_E2EE)
                    console.debug('[E2EE] decryption successful for message id', msg.id);
                  msg.message = plain;
                }
              } catch (err) {
                if (DEBUG_E2EE)
                  console.warn('[E2EE] decryption failed for message id', msg.id, err);
              }
            }
          }
          appendMessage(msg);
        }
      });
    } catch (e) {
      console.error('Socket subscription failed', e);
    }

    return () => {
      try {
        offFn?.();
      } catch (e) {
        // ignore
      }
    };
  }, [caseId, DEBUG_E2EE, appendMessage, on]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // keep refs in sync with state to avoid re-subscribing socket handlers
  useEffect(() => {
    localKeysRef.current = localKeys;
  }, [localKeys]);

  useEffect(() => {
    participantKeysRef.current = participantKeys;
  }, [participantKeys]);

  useEffect(() => {
    currentUserIdRef.current = currentUserId;
  }, [currentUserId]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    setSending(true);
    try {
      // If we have local keypair and participant public keys, perform per-recipient E2EE
      if (localKeys?.privateKey && Object.keys(participantKeys).length > 0) {
        const recipients: Array<{ userId: string; ciphertext: string; iv?: string }> = [];
        for (const [userId, pubB64] of Object.entries(participantKeys)) {
          try {
            let pub = importedKeyCache.current[userId];
            if (!pub) {
              pub = await importPublicKeyRaw(pubB64);
              importedKeyCache.current[userId] = pub;
            }
            const aes = await deriveAesKey(localKeys.privateKey as CryptoKey, pub);
            const enc = await encryptText(aes, newMessage.trim());
            recipients.push({ userId, ciphertext: enc.ciphertext, iv: enc.iv });
          } catch (err) {
            // skip recipients we can't encrypt for
          }
        }
        if (recipients.length > 0) {
          if (DEBUG_E2EE)
            console.debug(
              '[E2EE] sending encrypted message to recipients count=',
              recipients.length
            );
          await api.post(`/chat/${caseId}`, {
            encrypted: true,
            recipients,
          });
        } else {
          if (DEBUG_E2EE)
            console.debug('[E2EE] no recipients encrypted; sending plaintext fallback');
          // fallback to plaintext send
          await api.post(`/chat/${caseId}`, { message: newMessage.trim() });
        }
      } else {
        await api.post(`/chat/${caseId}`, {
          message: newMessage.trim(),
        });
      }
      // 서버가 Socket.IO로 브로드캐스트하므로 여기서는 입력만 초기화하고
      // 서버 푸시를 통해 메시지가 추가되도록 둡니다 (중복 방지).
      setNewMessage('');
      scrollToBottom();
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (messagesLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper
      elevation={0}
      sx={{
        height: 600,
        display: 'flex',
        flexDirection: 'column',
        border: `1px solid ${theme.palette.divider}`,
      }}
    >
      {/* 헤더 */}
      <Box
        sx={{
          p: 2,
          bgcolor: 'primary.main',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
      >
        <LockIcon fontSize="small" />
        <Typography variant="h6" fontWeight={600}>
          보안 채팅
        </Typography>
        <Chip
          label="종단간 암호화"
          size="small"
          icon={<CheckCircleIcon />}
          sx={{ ml: 'auto', bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
        />
      </Box>

      {/* 메시지 영역 */}
      <Box sx={{ flex: 1, overflowY: 'auto', p: 2, bgcolor: '#f5f5f5' }}>
        {messages.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography color="text.secondary">
              아직 메시지가 없습니다. 첫 메시지를 보내보세요.
            </Typography>
          </Box>
        ) : (
          messages.map((msg) => {
            const isOwnMessage = msg.senderId === currentUserId;
            return (
              <Box
                key={msg.id}
                sx={{
                  display: 'flex',
                  justifyContent: isOwnMessage ? 'flex-end' : 'flex-start',
                  mb: 2,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, maxWidth: '70%' }}>
                  {!isOwnMessage && <RolePill role={msg.senderRole} small />}
                  <Box>
                    {/* role label rendered by RolePill for non-own messages */}
                    <Paper
                      elevation={1}
                      sx={{
                        p: 1.5,
                        bgcolor: isOwnMessage ? 'primary.main' : 'white',
                        color: isOwnMessage ? 'white' : 'text.primary',
                        borderRadius: 2,
                        wordWrap: 'break-word',
                      }}
                    >
                      <Typography variant="body2">{msg.message}</Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          display: 'block',
                          mt: 0.5,
                          opacity: 0.7,
                          fontSize: '0.7rem',
                        }}
                      >
                        {new Date(msg.timestamp).toLocaleTimeString('ko-KR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                        {msg.encrypted && ' 🔒'}
                      </Typography>
                    </Paper>
                  </Box>
                  {isOwnMessage && <RolePill role={msg.senderRole} small />}
                </Box>
              </Box>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </Box>

      <Divider />

      {/* 입력 영역 */}
      <Box sx={{ p: 2, bgcolor: 'background.paper', display: 'flex', gap: 1 }}>
        <TextField
          fullWidth
          multiline
          maxRows={3}
          placeholder="메시지를 입력하세요... (Enter: 전송, Shift+Enter: 줄바꿈)"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={sending}
          variant="outlined"
          size="small"
        />
        <IconButton
          color="primary"
          onClick={handleSendMessage}
          disabled={!newMessage.trim() || sending}
          sx={{
            bgcolor: 'primary.main',
            color: 'white',
            '&:hover': { bgcolor: 'primary.dark' },
            '&:disabled': { bgcolor: 'action.disabledBackground' },
          }}
        >
          {sending ? <CircularProgress size={24} /> : <SendIcon />}
        </IconButton>
      </Box>
    </Paper>
  );
};

export default SecureChat;
