import { useEffect, useRef, useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { buildApiUrl } from '../api';
import { apiRoutes } from '../routes/apiRoutes';
import { getStoredUser, storeUser } from '../utils/auth';

const ThemeToggle = () => {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    document.body.className = theme === 'light' ? 'light-mode' : '';
    localStorage.setItem('theme', theme);
  }, [theme]);

  return (
    <button 
      onClick={() => setTheme(prev => prev === 'dark' ? 'light' : 'dark')} 
      style={{
        background: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)', 
        border: theme === 'dark' ? '1px solid rgba(255,255,255,0.2)' : '1px solid rgba(0,0,0,0.1)', 
        color: theme === 'dark' ? '#fff' : '#333', 
        padding: '8px 16px', 
        borderRadius: '20px', 
        cursor: 'pointer', 
        display: 'flex', 
        alignItems: 'center', 
        gap: '8px', 
        fontSize: '0.9rem',
        fontWeight: 'bold',
        transition: 'all 0.2s ease'
      }}
    >
      {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
    </button>
  );
};

const StatCounter = ({ end, duration = 2000, suffix = "" }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime;
    let animationFrame;

    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const progress = currentTime - startTime;

      if (progress < duration) {
        // Ease out quart for smooth animation
        const percentage = 1 - Math.pow(1 - progress / duration, 4);
        setCount(Math.floor(percentage * end));
        animationFrame = requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration]);

  return <span>{count}{suffix}</span>;
};

const RTC_CONFIGURATION = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' }
  ]
};

const createClientAttemptId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [viewMode, setViewMode] = useState('learning');
  const [showModal, setShowModal] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [ratingValue, setRatingValue] = useState(0);
  const [ratingComment, setRatingComment] = useState('');
  const [ratingSession, setRatingSession] = useState(null);
  const [modalType, setModalType] = useState('offered'); // 'offered' or 'wanted'
  const [skillForm, setSkillForm] = useState({
    name: '',
    category: 'Development',
    proficiency: 'Beginner',
    description: '',
    proofs: [],
    certificateFile: null
  });
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [activeSession, setActiveSession] = useState(null);
  const [activeSessionRole, setActiveSessionRole] = useState('learner');
  const [isVerifying, setIsVerifying] = useState(false);
  const [classChat, setClassChat] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [callStatus, setCallStatus] = useState('Waiting to connect...');
  const [mediaError, setMediaError] = useState('');
  const [isMicEnabled, setIsMicEnabled] = useState(true);
  const [isCameraEnabled, setIsCameraEnabled] = useState(true);
  const [hasRemoteMedia, setHasRemoteMedia] = useState(false);
  const [dashData, setDashData] = useState({
    upcomingSessions: [],
    topMentors: [],
    dailyChallenges: [],
    recentActivities: [],
    recommendedMatches: [],
    studentReviews: [],
    teachingSchedule: [],
    learningJourney: [],
    certificates: []
  });
  const navigate = useNavigate();
  const location = useLocation();
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteStreamRef = useRef(null);
  const signalingIntervalRef = useRef(null);
  const processedIceCandidatesRef = useRef(new Set());
  const appliedOfferRef = useRef('');
  const appliedAnswerRef = useRef('');
  const currentAttemptIdRef = useRef('');

  const getPeerEmail = () => {
    if (!activeSession || !user) return '';
    return activeSessionRole === 'learner'
      ? (activeSession.mentorEmail || '')
      : (activeSession.studentEmail || '');
  };

  const attachVideoStream = (videoRef, stream, muted = false) => {
    if (videoRef.current) {
      videoRef.current.srcObject = stream || null;
      videoRef.current.muted = muted;
      if (stream) {
        const tryPlay = () => {
          videoRef.current?.play?.().catch(() => {});
        };
        videoRef.current.onloadedmetadata = tryPlay;
        tryPlay();
      }
    }
  };

  const stopMediaStream = (stream) => {
    if (!stream) return;
    stream.getTracks().forEach(track => track.stop());
  };

  const cleanupPeerConnection = () => {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.onicecandidate = null;
      peerConnectionRef.current.ontrack = null;
      peerConnectionRef.current.onconnectionstatechange = null;
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    remoteStreamRef.current = null;
    attachVideoStream(remoteVideoRef, null);
    processedIceCandidatesRef.current.clear();
    appliedOfferRef.current = '';
    appliedAnswerRef.current = '';
  };

  const cleanupVideoSession = ({ keepModalOpen = false } = {}) => {
    if (signalingIntervalRef.current) {
      clearInterval(signalingIntervalRef.current);
      signalingIntervalRef.current = null;
    }
    cleanupPeerConnection();
    stopMediaStream(localStreamRef.current);
    localStreamRef.current = null;
    attachVideoStream(localVideoRef, null, true);
    currentAttemptIdRef.current = '';
    setClassChat([]);
    setChatInput('');
    setCallStatus('Waiting to connect...');
    setMediaError('');
    setIsMicEnabled(true);
    setIsCameraEnabled(true);
    setHasRemoteMedia(false);
    if (!keepModalOpen) {
      setShowVideoModal(false);
      setActiveSession(null);
    }
  };

  const postCallSignal = async ({ sessionId, type, payload = null, toEmail = '', attemptId = '' }) => {
    const response = await fetch(buildApiUrl('/api/user/session-call'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId,
        type,
        fromEmail: user.email,
        toEmail,
        payload,
        attemptId
      })
    });

    if (!response.ok) {
      let errorMessage = `Failed to send ${type} signal.`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch (_error) {
        const errorText = await response.text().catch(() => '');
        if (errorText) errorMessage = errorText;
      }
      throw new Error(errorMessage);
    }

    return response.json();
  };

  const fetchCallState = async (sessionId) => {
    const response = await fetch(buildApiUrl(`/api/user/session-call/${sessionId}?email=${encodeURIComponent(user.email)}`));
    if (!response.ok) {
      throw new Error('Failed to fetch call state.');
    }
    return response.json();
  };

  const ensurePeerConnection = async () => {
    if (peerConnectionRef.current) return peerConnectionRef.current;

    const peerConnection = new RTCPeerConnection(RTC_CONFIGURATION);

    if (!remoteStreamRef.current) {
      remoteStreamRef.current = new MediaStream();
      attachVideoStream(remoteVideoRef, remoteStreamRef.current);
    }

    peerConnection.ontrack = (event) => {
      if (!remoteStreamRef.current) {
        remoteStreamRef.current = new MediaStream();
      }

      const attachRemoteTrack = (track) => {
        if (!track) return;
        if (!remoteStreamRef.current.getTracks().some(existingTrack => existingTrack.id === track.id)) {
          remoteStreamRef.current.addTrack(track);
        }
        attachVideoStream(remoteVideoRef, remoteStreamRef.current);
        setHasRemoteMedia(true);
        setCallStatus('Connected');
      };

      if (event.track) {
        attachRemoteTrack(event.track);
        event.track.onunmute = () => {
          attachRemoteTrack(event.track);
        };
      }

      if (Array.isArray(event.streams) && event.streams.length > 0) {
        event.streams.forEach(stream => {
          stream.getTracks().forEach(track => {
            attachRemoteTrack(track);
          });
        });
      }
    };

    peerConnection.onicecandidate = async (event) => {
      if (!event.candidate || !activeSession) return;
      const peerEmail = getPeerEmail();
      if (!peerEmail) return;

      try {
        await postCallSignal({
          sessionId: activeSession.id,
          type: 'ice-candidate',
          payload: event.candidate.toJSON(),
          toEmail: peerEmail,
          attemptId: currentAttemptIdRef.current
        });
      } catch (error) {
        console.error('ICE candidate send error:', error);
      }
    };

    peerConnection.onconnectionstatechange = () => {
      const state = peerConnection.connectionState;
      if (state === 'connected') setCallStatus('Connected');
      if (state === 'connecting') setCallStatus('Connecting...');
      if (state === 'disconnected') setCallStatus('Connection lost. Trying to recover...');
      if (state === 'failed') setCallStatus('Connection failed. Rejoin the class to retry.');
      if (state === 'closed') setCallStatus('Call ended');
    };

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        peerConnection.addTrack(track, localStreamRef.current);
      });
    }

    peerConnectionRef.current = peerConnection;
    return peerConnection;
  };

  const setupLocalMedia = async () => {
    if (localStreamRef.current) return localStreamRef.current;

    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
    });

    localStreamRef.current = stream;
    setIsMicEnabled(true);
    setIsCameraEnabled(true);
    attachVideoStream(localVideoRef, stream, true);
    return stream;
  };

  const createAndSendOffer = async () => {
    const peerEmail = getPeerEmail();
    if (!activeSession?.id) return;
    if (!peerEmail) {
      throw new Error('Other participant email is missing for this session.');
    }

    const peerConnection = await ensurePeerConnection();
    const resetResponse = await postCallSignal({
      sessionId: activeSession.id,
      type: 'reset',
      toEmail: peerEmail
    });
    const attemptId = resetResponse?.call?.attemptId || currentAttemptIdRef.current || createClientAttemptId();
    currentAttemptIdRef.current = attemptId;
    processedIceCandidatesRef.current.clear();
    appliedOfferRef.current = '';
    appliedAnswerRef.current = '';

    const offer = await peerConnection.createOffer({
      offerToReceiveAudio: true,
      offerToReceiveVideo: true
    });
    await peerConnection.setLocalDescription(offer);
    await postCallSignal({
      sessionId: activeSession.id,
      type: 'offer',
      payload: peerConnection.localDescription,
      toEmail: peerEmail,
      attemptId
    });
    setCallStatus('Waiting for the other person to join...');
  };

  const syncCallState = async (callState) => {
    let peerConnection = await ensurePeerConnection();
    const nextAttemptId = callState.attemptId || currentAttemptIdRef.current || '';

    if (nextAttemptId && currentAttemptIdRef.current && nextAttemptId !== currentAttemptIdRef.current) {
      cleanupPeerConnection();
      currentAttemptIdRef.current = nextAttemptId;
      peerConnection = await ensurePeerConnection();
    } else if (nextAttemptId) {
      currentAttemptIdRef.current = nextAttemptId;
    }

    if (callState.offer && activeSessionRole === 'teacher') {
      const offerKey = `${callState.offer.attemptId}:${callState.offer.updatedAt}`;
      if (appliedOfferRef.current !== offerKey) {
        appliedOfferRef.current = offerKey;
        currentAttemptIdRef.current = callState.offer.attemptId || currentAttemptIdRef.current;
        if (!peerConnection.currentRemoteDescription) {
          await peerConnection.setRemoteDescription(new RTCSessionDescription(callState.offer.payload));
        }
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);
        await postCallSignal({
          sessionId: activeSession.id,
          type: 'answer',
          payload: peerConnection.localDescription,
          toEmail: callState.offer.fromEmail,
          attemptId: currentAttemptIdRef.current
        });
        setCallStatus('Connecting...');
      }
    }

    if (callState.answer && activeSessionRole === 'learner') {
      const answerKey = `${callState.answer.attemptId}:${callState.answer.updatedAt}`;
      if (appliedAnswerRef.current !== answerKey) {
        if (
          !peerConnection.currentRemoteDescription &&
          peerConnection.signalingState === 'have-local-offer'
        ) {
          try {
            await peerConnection.setRemoteDescription(new RTCSessionDescription(callState.answer.payload));
            appliedAnswerRef.current = answerKey;
          } catch (error) {
            if (error?.message?.includes('Called in wrong state: stable')) {
              appliedAnswerRef.current = answerKey;
              setCallStatus('Connected');
            } else {
              throw error;
            }
          }
        } else {
          appliedAnswerRef.current = answerKey;
          setCallStatus('Connected');
        }
        if (peerConnection.signalingState !== 'stable') {
          setCallStatus('Connecting...');
        }
      }
    }

    if (Array.isArray(callState.iceCandidates)) {
      for (const candidateEntry of callState.iceCandidates) {
        const candidateKey = JSON.stringify(candidateEntry);
        if (processedIceCandidatesRef.current.has(candidateKey) || !candidateEntry?.candidate) continue;

        try {
          await peerConnection.addIceCandidate(new RTCIceCandidate(candidateEntry.candidate));
          processedIceCandidatesRef.current.add(candidateKey);
        } catch (error) {
          console.error('ICE candidate apply error:', error);
        }
      }
    }
  };

  const closeVideoModal = () => {
    cleanupVideoSession();
  };

  useEffect(() => {
    const fetchUser = async () => {
      const parsedUser = getStoredUser();
      if (parsedUser) {
        try {
          const response = await fetch(buildApiUrl(`${apiRoutes.user.profile}?email=${encodeURIComponent(parsedUser.email)}`));
          if (response.ok) {
            const data = await response.json();
            if (data.rating === undefined) data.rating = 4.8;
            if (data.ratingCount === undefined) data.ratingCount = 12;
            setUser(data);
            if (!showVideoModal) {
              storeUser(data);
              window.dispatchEvent(new Event('user_updated')); // SYNC NAVBAR REALTIME
            }
          } else {
            setUser(parsedUser);
          }

          // Fetch Real-time Dashboard Data
          const dashResponse = await fetch(buildApiUrl(`/api/user/dashboard-data?email=${encodeURIComponent(parsedUser.email)}`));
          if (dashResponse.ok) {
              const dData = await dashResponse.json();
              setDashData(dData);
          }
        } catch (error) {
          console.error("Failed to fetch user data:", error);
          setUser(parsedUser);
        }
      } else {
        navigate('/login');
      }
    };

    fetchUser();
    // Real-time Database Sync (Updates every 5 seconds)
    const intervalId = setInterval(fetchUser, 5000);
    return () => clearInterval(intervalId);
  }, [navigate, showVideoModal]);

  // Real-time synchronization for closing the video modal if the other person ends it
  useEffect(() => {
    if (showVideoModal && activeSession) {
      const allSessions = [...(dashData.upcomingSessions || []), ...(dashData.teachingSchedule || [])];
      const sessionStillActive = allSessions.find(s => s.id === activeSession.id);
      
      if (!sessionStillActive) {
        // Session is no longer active in DB (meaning the other person ended it)
        setShowVideoModal(false);
        if (viewMode === 'learning') {
          setRatingSession(activeSession);
          setRatingValue(0);
          setRatingComment('');
          setShowRatingModal(true);
          alert("The mentor has ended the class. Please rate your session.");
        } else {
          alert("The learner has ended the class. You earned 1 credit!");
        }
      }
    }
  }, [dashData, showVideoModal, activeSession, viewMode]);

  useEffect(() => {
    return () => {
      cleanupVideoSession({ keepModalOpen: true });
    };
  }, []);

  const handleOpenModal = (type) => {
    setModalType(type);
    setSkillForm({
      name: '',
      category: 'Development',
      proficiency: 'Beginner',
      description: '',
      proofs: [],
      certificateFile: null
    });
    setIsVerifying(false);
    setShowModal(true);
  };

  // Modal auto-open logic from other pages
  useEffect(() => {
    if (location.state?.openModal) {
      const type = location.state.openModal;
      setViewMode(type === 'offered' ? 'teaching' : 'learning');
      setModalType(type);
      setSkillForm({
        name: '', category: 'Development', proficiency: 'Beginner',
        description: '', proofs: [], certificateFile: null
      });
      setIsVerifying(false);
      setShowModal(true);
      // Clear the state so it doesn't reopen on page refresh
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate, location.pathname]);

  const handleProofToggle = (proof) => {
    setSkillForm(prev => {
      const newProofs = prev.proofs.includes(proof)
        ? prev.proofs.filter(p => p !== proof)
        : [...prev.proofs, proof];
      
      return { ...prev, proofs: newProofs };
    });
  };

  const handleAddSkill = async (e) => {
    e.preventDefault();

    if (skillForm.proofs.length < 2) {
      alert("Please select at least 2 verification methods.");
      return;
    }

    if (skillForm.proofs.includes('Certificate') && !skillForm.certificateFile) {
      alert("Please upload a certificate file.");
      return;
    }

    setIsVerifying(true);

    try {
      // Simulate sending verification request to admin/teacher
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Formatting the skill string to include details (since backend expects string)
      const skillString = `${skillForm.name} (${skillForm.proficiency}) [Pending Approval: ${skillForm.proofs.join(', ')}]`;

      const formData = new FormData();
      formData.append('email', user.email);
      formData.append('skill', skillString);
      formData.append('type', modalType);
      if (skillForm.certificateFile) {
        formData.append('certificateFile', skillForm.certificateFile);
      }

      const response = await fetch(buildApiUrl('/api/user/skills'), {
        method: 'POST',
        body: formData,
      });

      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (err) {
        throw new Error("Server returned an invalid response. Backend route '/api/user/skills' might be missing.");
      }

      if (response.ok) {
        setUser(data.user);
        storeUser(data.user);
        window.dispatchEvent(new Event('user_updated')); // SYNC NAVBAR REALTIME
        setShowModal(false);
        alert("Verification request sent to Admin! Your skill is pending approval.");
      }
    } catch (error) {
      console.error('Error adding skill:', error);
      alert("Failed to verify or add skill.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleApproveSession = async (sessionId) => {
    try {
      const response = await fetch(buildApiUrl('/api/user/approve-session'), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId })
      });
      if (response.ok) {
        alert('Session approved! A message has been sent to the learner.');
        window.dispatchEvent(new Event('user_updated')); // refresh data
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleJoinVideo = async (session, isLearner) => {
    // If learner is joining for the first time, mark as Active to notify mentor
    if (isLearner && session.status === 'Scheduled') {
      try {
        await fetch(buildApiUrl('/api/user/join-session'), {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId: session.id })
        });
        window.dispatchEvent(new Event('user_updated')); // Trigger immediate refresh
      } catch (err) {
        console.error(err);
      }
    }
    setActiveSessionRole(isLearner ? 'learner' : 'teacher');
    setActiveSession({
      ...session,
      status: isLearner ? 'Active' : session.status
    });
    setChatInput('');
    setCallStatus('Preparing your camera and microphone...');
    setMediaError('');
    setShowVideoModal(true);
  };

  useEffect(() => {
    let isCancelled = false;

    const startVideoCall = async () => {
      if (!showVideoModal || !activeSession || !user) return;

      try {
        setMediaError('');
        setCallStatus('Requesting camera and microphone access...');
        await setupLocalMedia();
        await ensurePeerConnection();

        const initialState = await fetchCallState(activeSession.id);
        if (isCancelled) return;

        if (initialState.attemptId) {
          currentAttemptIdRef.current = initialState.attemptId;
        }

        await syncCallState(initialState);

        if (activeSessionRole === 'learner' && !initialState.offer) {
          await createAndSendOffer();
        } else if (activeSessionRole === 'teacher' && !initialState.offer) {
          setCallStatus('Waiting for learner to start the call...');
        }

        if (signalingIntervalRef.current) {
          clearInterval(signalingIntervalRef.current);
        }

        signalingIntervalRef.current = setInterval(async () => {
          try {
            const latestState = await fetchCallState(activeSession.id);
            if (!isCancelled) {
              await syncCallState(latestState);
            }
          } catch (error) {
            console.error('Call sync error:', error);
          }
        }, 1500);
      } catch (error) {
        console.error('Video start error:', error);
        setMediaError(error.message || 'Camera or microphone access failed.');
        setCallStatus('Unable to start video call');
      }
    };

    startVideoCall();

    return () => {
      isCancelled = true;
      cleanupVideoSession({ keepModalOpen: true });
    };
  }, [showVideoModal, activeSession, activeSessionRole, user?.email]);

  // Real-time Live Chat Sync (every 2 seconds while modal is open)
  useEffect(() => {
    let chatInterval;
    if (showVideoModal && activeSession) {
      const fetchChat = async () => {
        try {
          const res = await fetch(buildApiUrl(`/api/user/session-chat/${activeSession.id}`));
          if (res.ok) setClassChat(await res.json());
        } catch (err) {
          console.error("Chat fetch error:", err);
        }
      };
      fetchChat();
      chatInterval = setInterval(fetchChat, 2000);
    }
    return () => clearInterval(chatInterval);
  }, [showVideoModal, activeSession]);

  const handleSendChat = async (e) => {
    if (e.key === 'Enter' && chatInput.trim() && activeSession) {
      e.preventDefault();
      const text = chatInput.trim();
      setChatInput('');
      try {
        await fetch(buildApiUrl('/api/user/session-chat'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId: activeSession.id, sender: user.name, text })
        });
        // Fetch immediately after sending to show our own msg instantly
        const res = await fetch(buildApiUrl(`/api/user/session-chat/${activeSession.id}`));
        if (res.ok) setClassChat(await res.json());
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleEndVideo = async () => {
    if (!activeSession) return;
    try {
      await fetch(buildApiUrl('/api/user/end-session'), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: activeSession.id })
      });
      cleanupVideoSession({ keepModalOpen: true });
      setShowVideoModal(false);
      window.dispatchEvent(new Event('user_updated')); // fetch updated credits

      if (viewMode === 'learning') {
        setRatingSession(activeSession);
        setRatingValue(0);
        setRatingComment('');
        setShowRatingModal(true);
      } else {
        alert('Session completed! You earned 1 credit.');
      }
    } catch (err) {
      console.error('End session error:', err);
    }
  };

  const toggleTrack = (kind) => {
    const stream = localStreamRef.current;
    if (!stream) return;

    const tracks = kind === 'audio' ? stream.getAudioTracks() : stream.getVideoTracks();
    const enabled = tracks.some(track => track.enabled);
    tracks.forEach(track => {
      track.enabled = !enabled;
    });

    if (kind === 'audio') setIsMicEnabled(!enabled);
    if (kind === 'video') setIsCameraEnabled(!enabled);
  };

  const submitRating = async () => {
    if (ratingValue === 0) {
      alert("Rating is mandatory! Please select a star rating to complete the session.");
      return;
    }
    try {
      const response = await fetch(buildApiUrl(apiRoutes.user.sessionFeedback), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submittedByEmail: user.email,
          teacherName: ratingSession?.mentorName || 'Community Mentor',
          teacherEmail: ratingSession?.mentorEmail || '',
          skillTaught: ratingSession?.title || user.skillsWanted?.[0] || 'General Session',
          rating: ratingValue,
          complaint: ratingComment
        })
      });

      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (err) {
        throw new Error("Server returned an invalid HTML response. Backend route '/api/user/session-feedback' might be missing.");
      }

      if (!response.ok) {
        alert(data.message || data.error || 'Failed to submit rating.');
        return;
      }
      if (data.teacher && data.teacher.email === user.email) {
        setUser(data.teacher);
        storeUser(data.teacher);
        window.dispatchEvent(new Event('user_updated')); // SYNC NAVBAR REALTIME
      }
      alert(`Session completed! You rated it ${ratingValue} stars.`);
      setShowRatingModal(false);
    } catch (error) {
      console.error('Session feedback error:', error.message);
      alert(error.message || 'Could not connect to backend to submit the rating.');
    }
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div>
      <div className="dashboard-header">
        <div style={{ textAlign: 'left' }}>
          <h2>Welcome back, <span style={{ color: '#646cff' }}>{user.name}</span>! 👋</h2>
          <p style={{ opacity: 0.7 }}>Here's what's happening with your skills today.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <ThemeToggle />
          <div className="view-toggle">
            <button 
              className={viewMode === 'learning' ? 'active' : ''} 
              onClick={() => setViewMode('learning')}
            >
              Learning
            </button>
            <button 
              className={viewMode === 'teaching' ? 'active' : ''} 
              onClick={() => setViewMode('teaching')}
            >
              Teaching
            </button>
            <button 
              className={viewMode === 'certificates' ? 'active' : ''} 
              onClick={() => setViewMode('certificates')}
            >
              Certificates
            </button>
          </div>
        </div>
      </div>

      {viewMode === 'learning' ? (
        <>
          {/* Learning Stats */}
          <div className="dashboard-stats">
            <div className="stat-card">
              <h4><StatCounter end={user.credits !== undefined ? user.credits : 5} /></h4>
              <p>Learning Credits</p>
            </div>
            <div className="stat-card">
              <h4><StatCounter end={user.skillsWanted?.length || 0} /></h4>
              <p>Skills Wanted</p>
            </div>
            <div className="stat-card">
              <h4><StatCounter end={user.ratingCount || 0} /></h4>
              <p>Total Swaps</p>
            </div>
            <div className="stat-card">
              <h4><StatCounter end={(user.ratingCount || 0) * 2} suffix="h" /></h4>
              <p>Hours Learned</p>
            </div>
            <div className="stat-card">
              <h4>{typeof user.rating === 'number' ? user.rating.toFixed(1) : (user.rating || 'New')} ⭐</h4>
              <p>My Rating</p>
            </div>
          </div>

          {/* Learning Journey Section */}
          <div className="dashboard-grid" style={{ marginTop: '0', marginBottom: '2rem' }}>
            <div className="skill-card" style={{ gridColumn: '1 / -1' }}>
              <h3>🚀 Your Learning Journey</h3>
              <div className="progress-container">
                {dashData.learningJourney && dashData.learningJourney.length > 0 ? (
                  dashData.learningJourney.map((item, idx) => (
                    <div className="progress-item" key={idx}>
                      <div className="progress-header">
                        <span>{item.skill}</span>
                        <span>{item.progress}%</span>
                      </div>
                      <div className="progress-bar"><div className="progress-fill" style={{ width: `${item.progress}%`, background: item.color }}></div></div>
                    </div>
                  ))
                ) : (
                  <p style={{ color: '#aaa', textAlign: 'center', padding: '1rem', width: '100%' }}>Add skills you want to learn to track your progress!</p>
                )}
              </div>
            </div>
          </div>
          
          <div className="dashboard-grid">
            <div className="skill-card">
              <h3>Skills I Want to Learn</h3>
              <ul className="skill-list">
                {user.skillsWanted && user.skillsWanted.map((skill, index) => (
                  <li key={index}>{skill}</li>
                ))}
                {(!user.skillsWanted || user.skillsWanted.length === 0) && (
                  <li style={{ justifyContent: 'center', color: '#aaa' }}>No skills added yet.</li>
                )}
              </ul>
              <div className="add-skill-box">
                <button className="btn-primary" style={{ width: '100%' }} onClick={() => handleOpenModal('wanted')}>
                  + Add New Skill
                </button>
              </div>
            </div>

            <div className="skill-card">
              <h3>📅 Upcoming Sessions</h3>
              <div className="session-list">
                {dashData.upcomingSessions && dashData.upcomingSessions.length > 0 ? dashData.upcomingSessions.map((session, idx) => (
                  <div className="session-item" key={idx}>
                    <div className="session-date">
                      <span className="day">{session.day || '15'}</span>
                      <span className="month">{session.month || 'OCT'}</span>
                    </div>
                    <div className="session-details">
                      <strong>{session.title}</strong>
                      <small>with {session.mentorName} • {session.time}</small>
                    </div>
                    {session.status === 'Pending' ? (
                      <span style={{ fontSize: '0.8rem', color: '#f59e0b', padding: '5px 10px', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '6px' }}>Pending Approval</span>
                    ) : (
                      <button className="btn-primary" style={{ padding: '5px 10px', fontSize: '0.8rem', background: '#10b981', border: 'none' }} onClick={() => handleJoinVideo(session, true)}>🎥 Join Video</button>
                    )}
                  </div>
                )) : (
                  <p style={{ color: '#aaa', textAlign: 'center', padding: '1rem', width: '100%' }}>No upcoming sessions scheduled.</p>
                )}
              </div>
            </div>
          </div>

          {/* New Learning Content */}
          <div className="dashboard-grid">
            <div className="skill-card">
              <h3>🏆 Top Mentors</h3>
              <div className="mentors-list">
                {dashData.topMentors && dashData.topMentors.length > 0 ? dashData.topMentors.map((mentor, idx) => (
                  <div className="mentor-item" key={idx}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <div className="avatar" style={{ background: mentor.avatarBg }}>{mentor.initials}</div>
                      <div>
                        <strong>{mentor.name}</strong>
                        <small style={{ display: 'block', color: '#aaa', fontSize: '0.8rem' }}>{mentor.expertIn}</small>
                      </div>
                    </div>
                    <button className="btn-outline" style={{ padding: '4px 12px', fontSize: '0.8rem' }}>Follow</button>
                  </div>
                )) : (
                  <p style={{ color: '#aaa', textAlign: 'center', padding: '1rem', width: '100%' }}>No mentors found yet.</p>
                )}
              </div>
            </div>
            <div className="skill-card">
              <h3>⚡ Daily Challenges</h3>
              <div className="challenges-list">
                {dashData.dailyChallenges && dashData.dailyChallenges.length > 0 ? dashData.dailyChallenges.map((challenge, idx) => (
                  <div className="challenge-item" key={idx}>
                    <strong>{challenge.title}</strong>
                    <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '12px', background: challenge.bgClass, color: challenge.colorClass }}>{challenge.difficulty}</span>
                  </div>
                )) : (
                  <p style={{ color: '#aaa', textAlign: 'center', padding: '1rem', width: '100%' }}>No challenges available.</p>
                )}
              </div>
            </div>
          </div>
        </>
      ) : viewMode === 'teaching' ? (
        <>
          {/* Teaching Stats */}
          <div className="dashboard-stats">
            <div className="stat-card">
              <h4><StatCounter end={user.skillsOffered?.length || 0} /></h4>
              <p>Skills Offered</p>
            </div>
            <div className="stat-card">
              <h4><StatCounter end={user.ratingCount || 0} /></h4>
              <p>Sessions Completed</p>
            </div>
            <div className="stat-card">
              <h4><StatCounter end={(user.ratingCount || 0) * 2} suffix="h" /></h4>
              <p>Hours Taught</p>
            </div>
            <div className="stat-card">
              <h4>{user.rating} ⭐</h4>
              <p>My Rating</p>
            </div>
          </div>

          <div className="dashboard-grid">
            <div className="skill-card">
              <h3>Skills I Can Teach</h3>
              <ul className="skill-list">
                {user.skillsOffered && user.skillsOffered.map((skill, index) => (
                  <li key={index}>{skill}</li>
                ))}
                {(!user.skillsOffered || user.skillsOffered.length === 0) && (
                  <li style={{ justifyContent: 'center', color: '#aaa' }}>No skills offered yet.</li>
                )}
              </ul>
              <div className="add-skill-box">
                <button className="btn-primary" style={{ width: '100%' }} onClick={() => handleOpenModal('offered')}>
                  + Add New Skill
                </button>
              </div>
            </div>

            <div className="skill-card">
              <h3>🔥 Recommended Matches</h3>
              <div className="matches-list">
                {dashData.recommendedMatches && dashData.recommendedMatches.length > 0 ? dashData.recommendedMatches.map((match, idx) => (
                  <div className="match-item" key={idx}>
                    <div className="avatar" style={{ background: match.avatarBg }}>{match.initials}</div>
                    <div className="match-info">
                      <strong>{match.name}</strong>
                      <small>Wants to learn: {match.wantsToLearn}</small>
                    </div>
                    <button className="btn-outline" style={{ padding: '5px 10px', fontSize: '0.8rem' }}>Connect</button>
                  </div>
                )) : (
                  <p style={{ color: '#aaa', textAlign: 'center', padding: '1rem', width: '100%' }}>No recommended matches yet.</p>
                )}
              </div>
            </div>
          </div>

          {/* New Teaching Content */}
          <div className="dashboard-grid">
            <div className="skill-card">
              <h3>🌟 Student Reviews</h3>
              <div className="reviews-list">
                {dashData.studentReviews && dashData.studentReviews.length > 0 ? dashData.studentReviews.map((rev, idx) => (
                  <div className="review-item" key={idx}>
                    <p>"{rev.comment}"</p>
                    <small>- {rev.studentName} ({rev.skill})</small>
                  </div>
                )) : (
                  <p style={{ color: '#aaa', textAlign: 'center', padding: '1rem', width: '100%' }}>No reviews yet.</p>
                )}
              </div>
            </div>

            <div className="skill-card">
              <h3>📅 My Teaching Schedule</h3>
              <div className="session-list">
                {dashData.teachingSchedule && dashData.teachingSchedule.length > 0 ? dashData.teachingSchedule.map((session, idx) => (
                  <div className="session-item" key={idx}>
                    <div className="session-date">
                      <span className="day">{session.day || '20'}</span>
                      <span className="month">{session.month || 'OCT'}</span>
                    </div>
                    <div className="session-details">
                      <strong>{session.title}</strong>
                      <small>Student: {session.studentName} • {session.time}</small>
                    </div>
                    {session.status === 'Pending' ? (
                      <button className="btn-primary" style={{ padding: '5px 10px', fontSize: '0.8rem' }} onClick={() => handleApproveSession(session.id)}>Approve</button>
                    ) : session.status === 'Scheduled' ? (
                      <span style={{ fontSize: '0.8rem', color: '#646cff', padding: '5px 10px', background: 'rgba(100, 108, 255, 0.1)', borderRadius: '6px' }}>Waiting for Learner...</span>
                    ) : (
                      <button className="btn-primary" style={{ padding: '5px 10px', fontSize: '0.8rem', background: '#10b981', border: 'none' }} onClick={() => handleJoinVideo(session, false)}>🎥 Join Video</button>
                    )}
                  </div>
                )) : (
                  <p style={{ color: '#aaa', textAlign: 'center', padding: '1rem', width: '100%' }}>No scheduled sessions.</p>
                )}
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Certificates Stats */}
          <div className="dashboard-stats">
            <div className="stat-card">
              <h4><StatCounter end={dashData.certificates?.length || 0} /></h4>
              <p>Certificates Earned</p>
            </div>
            <div className="stat-card">
              <h4><StatCounter end={user.skillsWanted?.length || 0} /></h4>
              <p>In Progress</p>
            </div>
          </div>

          <div className="dashboard-grid">
            <div className="skill-card">
              <h3>🎓 My Certificates</h3>
              <div className="session-list">
                {dashData.certificates && dashData.certificates.length > 0 ? dashData.certificates.map((cert, idx) => (
                  <div className="session-item" key={idx}>
                    <div className="session-date" style={{ background: 'rgba(16, 185, 129, 0.2)' }}>
                      <span className="day" style={{ color: '#10b981' }}>✔</span>
                    </div>
                    <div className="session-details">
                      <strong>{cert.title}</strong>
                      <small>Issued by {cert.issuer} • {cert.date}</small>
                    </div>
                    <button className="btn-outline" style={{ padding: '5px 10px', fontSize: '0.8rem' }} onClick={() => alert('Certificate PDF generated successfully!')}>Download</button>
                  </div>
                )) : (
                  <p style={{ color: '#aaa', textAlign: 'center', padding: '1rem', width: '100%' }}>No certificates earned yet. Teach a skill to get one!</p>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Shared Activity Section */}
      <div className="dashboard-grid">
        <div className="skill-card">
          <h3>📢 Recent Activity</h3>
          <ul className="activity-list">
              {dashData.recentActivities && dashData.recentActivities.length > 0 ? dashData.recentActivities.map((act, idx) => (
                <li key={idx}>
                  <span className="activity-icon">{act.icon}</span>
                  <div>
                    <strong>{act.title}</strong>
                    <small>{act.desc}</small>
                  </div>
                </li>
              )) : (
                <li style={{ color: '#aaa', justifyContent: 'center' }}>No recent activity.</li>
              )}
          </ul>
        </div>
      </div>

      {/* Add Skill Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add {modalType === 'offered' ? 'Teaching' : 'Learning'} Skill</h3>
              <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleAddSkill} style={{ marginTop: 0 }}>
              <div className="form-group">
                <label>Skill Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. React, Guitar, Spanish" 
                  value={skillForm.name}
                  onChange={(e) => setSkillForm({...skillForm, name: e.target.value})}
                  required 
                />
              </div>
              <div className="form-group">
                <label>Category</label>
                <select value={skillForm.category} onChange={(e) => setSkillForm({...skillForm, category: e.target.value})}>
                  <option>Development</option>
                  <option>Design</option>
                  <option>Music</option>
                  <option>Language</option>
                  <option>Lifestyle</option>
                </select>
              </div>
              <div className="form-group">
                <label>Proficiency Level</label>
                <select value={skillForm.proficiency} onChange={(e) => setSkillForm({...skillForm, proficiency: e.target.value, proofs: [], certificateFile: null})}>
                  <option>Beginner</option>
                  <option>Intermediate</option>
                  <option>Advanced</option>
                  <option>Expert</option>
                </select>
              </div>
              <div className="form-group">
                <label>Proficiency Proof (Select at least 2)</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px', background: 'rgba(0,0,0,0.2)', padding: '10px', borderRadius: '8px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '0.9rem' }}>
                    <input 
                      type="checkbox" 
                      checked={skillForm.proofs.includes('Certificate')}
                      onChange={() => handleProofToggle('Certificate')}
                      style={{ width: 'auto' }}
                    />
                    Upload Certificate
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '0.9rem' }}>
                    <input 
                      type="checkbox" 
                      checked={skillForm.proofs.includes(skillForm.proficiency === 'Beginner' ? 'Basic Test' : 'Assessment')}
                      onChange={() => handleProofToggle(skillForm.proficiency === 'Beginner' ? 'Basic Test' : 'Assessment')}
                      style={{ width: 'auto' }}
                    />
                    {skillForm.proficiency === 'Beginner' ? 'Basic Skill Quiz' : 'Standard Assessment Test'}
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '0.9rem' }}>
                    <input 
                      type="checkbox" 
                      checked={skillForm.proofs.includes('Live Interaction')}
                      onChange={() => handleProofToggle('Live Interaction')}
                      style={{ width: 'auto' }}
                    />
                    5-min Live Video Interaction
                  </label>
                </div>
              </div>
              {skillForm.proofs.includes('Certificate') && (
                <div className="form-group">
                  <label>Upload Certificate</label>
                  <input 
                    type="file" 
                    style={{ padding: '8px' }} 
                    onChange={(e) => setSkillForm({...skillForm, certificateFile: e.target.files[0]})}
                  />
                </div>
              )}
              <div className="form-group">
                <label>Description (Optional)</label>
                <textarea placeholder="Briefly describe your experience or goals..." value={skillForm.description} onChange={(e) => setSkillForm({...skillForm, description: e.target.value})}></textarea>
              </div>
              <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={isVerifying}>
                {isVerifying ? 'Sending Request...' : 'Send Verification Request'}
              </button>
            </form>
          </div>
        </div>
      )}

      {showVideoModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'fadeIn 0.2s ease-out' }}>
          <div style={{ background: '#1f2937', padding: '30px', borderRadius: '16px', width: '95vw', height: '95vh', border: '1px solid #374151', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <h3 style={{ margin: 0, color: '#fff', fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>Live Class: {activeSession?.title}</h3>
              <button onClick={closeVideoModal} style={{ background: 'transparent', color: '#ef4444', border: 'none', fontSize: '1.5rem', cursor: 'pointer', padding: '0 10px' }}>x</button>
            </div>
            <div style={{ margin: '0 0 20px 0', display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{ background: 'rgba(100,108,255,0.15)', border: '1px solid rgba(100,108,255,0.3)', color: '#93c5fd', padding: '6px 12px', borderRadius: '8px', fontSize: '0.95rem' }}>Host: <strong style={{ color: '#fff' }}>{activeSession?.mentorName}</strong></span>
              <span style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', color: '#6ee7b7', padding: '6px 12px', borderRadius: '8px', fontSize: '0.95rem' }}>Learner: <strong style={{ color: '#fff' }}>{activeSession?.studentName || user.name}</strong></span>
              <span style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', color: '#e5e7eb', padding: '6px 12px', borderRadius: '8px', fontSize: '0.95rem' }}>{callStatus}</span>
              <span style={{ color: '#aaa', fontSize: '0.9rem', marginLeft: 'auto' }}>Time is unlimited</span>
            </div>
            {mediaError && (
              <div style={{ marginBottom: '16px', padding: '12px 14px', borderRadius: '10px', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)', color: '#fecaca' }}>
                {mediaError}
              </div>
            )}

            <div style={{ flex: 1, display: 'flex', gap: '20px', overflow: 'hidden' }}>
              <div style={{ flex: 2, background: '#000', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '2px solid #374151', position: 'relative', overflow: 'hidden' }}>
                <video ref={remoteVideoRef} autoPlay playsInline style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px' }} />
                {!hasRemoteMedia && (
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#d1d5db', gap: '12px', background: 'rgba(0,0,0,0.35)' }}>
                    <span style={{ fontSize: '4rem' }}>Video</span>
                    <span style={{ fontSize: '1rem', color: '#10b981' }}>Waiting for the other participant...</span>
                  </div>
                )}
                <div style={{ position: 'absolute', bottom: '20px', left: '20px', background: 'rgba(0,0,0,0.8)', padding: '8px 15px', borderRadius: '8px', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid #374151' }}>
                  {viewMode === 'learning' ? <span>Host: <strong>{activeSession?.mentorName}</strong></span> : <span>Learner: <strong>{activeSession?.studentName || 'Student'}</strong></span>}
                </div>
              </div>

              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ flex: 1, background: '#111827', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #374151', position: 'relative', overflow: 'hidden' }}>
                  <video ref={localVideoRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px' }} />
                  {!localStreamRef.current && <span style={{ fontSize: '2rem', position: 'absolute' }}>You</span>}
                  <div style={{ position: 'absolute', bottom: '10px', left: '10px', background: 'rgba(0,0,0,0.8)', padding: '5px 10px', borderRadius: '6px', color: '#fff', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px', border: '1px solid #374151' }}>
                    {viewMode === 'learning' ? <span>Learner (You)</span> : <span>Host (You)</span>}
                  </div>
                </div>
                <div style={{ flex: 2, background: '#111827', borderRadius: '12px', border: '1px solid #374151', padding: '15px', display: 'flex', flexDirection: 'column' }}>
                  <h4 style={{ marginTop: 0, color: '#e5e7eb', borderBottom: '1px solid #374151', paddingBottom: '10px' }}>Class Chat</h4>
                  <div style={{ flex: 1, overflowY: 'auto', marginBottom: '10px', display: 'flex', flexDirection: 'column', gap: '8px', paddingRight: '5px' }}>
                    <div style={{ alignSelf: 'center', color: '#10b981', padding: '4px 0', fontSize: '0.85rem', fontStyle: 'italic', textAlign: 'center' }}>Welcome to the live class! You can chat here.</div>
                    {classChat.map((msg, i) => (
                      <div key={i} style={{
                        alignSelf: msg.sender === user.name ? 'flex-end' : 'flex-start',
                        background: msg.sender === user.name ? '#646cff' : '#374151',
                        color: '#fff',
                        padding: '8px 12px',
                        borderRadius: '12px',
                        fontSize: '0.9rem',
                        maxWidth: '85%'
                      }}>
                        {msg.sender !== user.name && <strong style={{ display: 'block', fontSize: '0.75rem', marginBottom: '2px', color: '#aaa' }}>{msg.sender}</strong>}
                        {msg.text}
                      </div>
                    ))}
                  </div>
                  <input type="text" placeholder="Type a message and press Enter..." value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={handleSendChat} style={{ width: '100%', boxSizing: 'border-box', padding: '12px', borderRadius: '8px', border: '1px solid #374151', background: '#1f2937', color: '#fff', outline: 'none' }} />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #374151' }}>
              <button onClick={() => toggleTrack('audio')} style={{ background: isMicEnabled ? '#374151' : '#7f1d1d', color: '#fff', border: 'none', padding: '15px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem', marginRight: '12px' }}>
                {isMicEnabled ? 'Mute Mic' : 'Unmute Mic'}
              </button>
              <button onClick={() => toggleTrack('video')} style={{ background: isCameraEnabled ? '#374151' : '#7f1d1d', color: '#fff', border: 'none', padding: '15px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem', marginRight: '12px' }}>
                {isCameraEnabled ? 'Turn Camera Off' : 'Turn Camera On'}
              </button>
              <button onClick={handleEndVideo} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '15px 30px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                End Class
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Live Video Interaction Modal */}
      {false && showVideoModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'fadeIn 0.2s ease-out' }}>
          <div style={{ background: '#1f2937', padding: '30px', borderRadius: '16px', width: '95vw', height: '95vh', border: '1px solid #374151', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <h3 style={{ margin: 0, color: '#fff', fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>🔴 Live Class: {activeSession?.title}</h3>
              <button onClick={() => setShowVideoModal(false)} style={{ background: 'transparent', color: '#ef4444', border: 'none', fontSize: '1.5rem', cursor: 'pointer', padding: '0 10px' }}>✖</button>
            </div>
            <div style={{ margin: '0 0 20px 0', display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{ background: 'rgba(100,108,255,0.15)', border: '1px solid rgba(100,108,255,0.3)', color: '#93c5fd', padding: '6px 12px', borderRadius: '8px', fontSize: '0.95rem' }}>👑 Host (Teacher): <strong style={{ color: '#fff' }}>{activeSession?.mentorName}</strong></span>
              <span style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', color: '#6ee7b7', padding: '6px 12px', borderRadius: '8px', fontSize: '0.95rem' }}>🎓 Learner: <strong style={{ color: '#fff' }}>{activeSession?.studentName || user.name}</strong></span>
              <span style={{ color: '#aaa', fontSize: '0.9rem', marginLeft: 'auto' }}>⏳ Time is unlimited!</span>
            </div>

            <div style={{ flex: 1, display: 'flex', gap: '20px', overflow: 'hidden' }}>
              {/* Main Video (Other Person) */}
              <div style={{ flex: 2, background: '#000', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '2px solid #374151', position: 'relative' }}>
                <span style={{ fontSize: '4rem', marginBottom: '1rem' }}>📹</span>
                <span style={{ fontSize: '1.2rem', color: '#10b981', animation: 'pulse 2s infinite' }}>Connected & Active</span>
                <div style={{ position: 'absolute', bottom: '20px', left: '20px', background: 'rgba(0,0,0,0.8)', padding: '8px 15px', borderRadius: '8px', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid #374151' }}>
                  {viewMode === 'learning' ? <><span style={{fontSize:'1.2rem'}}>👑</span> <span>Host: <strong>{activeSession?.mentorName}</strong></span></> : <><span style={{fontSize:'1.2rem'}}>🎓</span> <span>Learner: <strong>{activeSession?.studentName || 'Student'}</strong></span></>}
                </div>
              </div>

              {/* Sidebar (My Video & Chat) */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ flex: 1, background: '#111827', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #374151', position: 'relative' }}>
                  <span style={{ fontSize: '2rem' }}>🧑‍💻</span>
                  <div style={{ position: 'absolute', bottom: '10px', left: '10px', background: 'rgba(0,0,0,0.8)', padding: '5px 10px', borderRadius: '6px', color: '#fff', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px', border: '1px solid #374151' }}>
                    {viewMode === 'learning' ? <><span style={{fontSize:'1rem'}}>🎓</span> <span>Learner (You)</span></> : <><span style={{fontSize:'1rem'}}>👑</span> <span>Host (You)</span></>}
                  </div>
                </div>
                <div style={{ flex: 2, background: '#111827', borderRadius: '12px', border: '1px solid #374151', padding: '15px', display: 'flex', flexDirection: 'column' }}>
                  <h4 style={{ marginTop: 0, color: '#e5e7eb', borderBottom: '1px solid #374151', paddingBottom: '10px' }}>Class Chat</h4>
                  <div style={{ flex: 1, overflowY: 'auto', marginBottom: '10px', display: 'flex', flexDirection: 'column', gap: '8px', paddingRight: '5px' }}>
                    <div style={{ alignSelf: 'center', color: '#10b981', padding: '4px 0', fontSize: '0.85rem', fontStyle: 'italic', textAlign: 'center' }}>Welcome to the live class! You can chat here.</div>
                    {classChat.map((msg, i) => (
                      <div key={i} style={{ 
                        alignSelf: msg.sender === user.name ? 'flex-end' : 'flex-start', 
                        background: msg.sender === user.name ? '#646cff' : '#374151', 
                        color: '#fff', 
                        padding: '8px 12px', 
                        borderRadius: '12px', 
                        fontSize: '0.9rem', 
                        maxWidth: '85%' 
                      }}>
                        {msg.sender !== user.name && <strong style={{display:'block', fontSize:'0.75rem', marginBottom:'2px', color:'#aaa'}}>{msg.sender}</strong>}
                        {msg.text}
                      </div>
                    ))}
                  </div>
                  <input type="text" placeholder="Type a message and press Enter..." value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={handleSendChat} style={{ width: '100%', boxSizing: 'border-box', padding: '12px', borderRadius: '8px', border: '1px solid #374151', background: '#1f2937', color: '#fff', outline: 'none' }} />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #374151' }}>
              <button onClick={handleEndVideo} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '15px 30px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                📞 End Class
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mandatory Rating Modal */}
      {showRatingModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ textAlign: 'center', maxWidth: '400px' }}>
            <h3 style={{ marginBottom: '1rem' }}>Rate Session</h3>
            <p style={{ color: '#aaa', marginBottom: '1.5rem' }}>Session complete! Please rate your experience to continue.</p>
            <div style={{ fontSize: '2.5rem', marginBottom: '1.5rem', cursor: 'pointer', display: 'flex', justifyContent: 'center', gap: '10px' }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <span 
                  key={star} 
                  onClick={() => setRatingValue(star)}
                  style={{ color: star <= ratingValue ? '#fbbf24' : '#444', transition: 'color 0.2s' }}
                >
                  ★
                </span>
              ))}
            </div>
            <textarea 
              placeholder="Write a brief review (optional)..." 
              value={ratingComment}
              onChange={(e) => setRatingComment(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #333', background: '#222', color: '#fff', marginBottom: '1.5rem', minHeight: '80px' }}
            ></textarea>
            <button className="btn-primary" onClick={submitRating} style={{ width: '100%' }}>Submit Rating</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
