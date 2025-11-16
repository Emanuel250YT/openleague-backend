/**
 * Ejemplo de uso del sistema de Notificaciones y Retos
 * 
 * Este archivo muestra cómo interactuar con las APIs de notificaciones y retos
 */

// ============================================
// EJEMPLO 1: Flujo completo de participación en un reto
// ============================================

async function participateInChallenge() {
  const token = 'your-jwt-token';
  const baseUrl = 'http://localhost:3000';

  // 1. Ver retos activos
  const activeChallengesResponse = await fetch(`${baseUrl}/challenges/active`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  const activeChallenges = await activeChallengesResponse.json();
  console.log('Retos activos:', activeChallenges);

  // 2. Seleccionar un reto
  const selectedChallenge = activeChallenges[0];
  console.log('Reto seleccionado:', selectedChallenge.title);

  // 3. Subir video a Arka CDN
  const formData = new FormData();
  formData.append('file', videoFile); // Tu archivo de video
  formData.append('description', 'Mi participación en el reto');
  formData.append('compress', 'true');
  formData.append('enableDashStreaming', 'true');

  const uploadResponse = await fetch(`${baseUrl}/upload/file`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });
  const uploadedFile = await uploadResponse.json();
  console.log('Video subido:', uploadedFile.publicUrl);

  // 4. Crear participación en el reto
  const submissionResponse = await fetch(`${baseUrl}/challenges/submissions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      challengeId: selectedChallenge.id,
      arkaFileId: uploadedFile.arkaFileId,
      videoUrl: uploadedFile.publicUrl,
      description: 'Mi mejor regate del año',
      thumbnailUrl: uploadedFile.thumbnailUrl
    })
  });
  const submission = await submissionResponse.json();
  console.log('Participación creada:', submission);

  // 5. Verificar notificaciones
  const notificationsResponse = await fetch(`${baseUrl}/notifications`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  const notifications = await notificationsResponse.json();
  console.log('Notificaciones:', notifications);
}

// ============================================
// EJEMPLO 2: Gestión de notificaciones
// ============================================

async function manageNotifications() {
  const token = 'your-jwt-token';
  const baseUrl = 'http://localhost:3000';

  // Obtener contador de no leídas
  const unreadResponse = await fetch(`${baseUrl}/notifications/unread-count`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  const unreadCount = await unreadResponse.json();
  console.log('Notificaciones no leídas:', unreadCount.count);

  // Obtener notificaciones con filtros
  const notificationsResponse = await fetch(
    `${baseUrl}/notifications?type=CHALLENGE_NEW&isRead=false&page=1&limit=10`,
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );
  const notifications = await notificationsResponse.json();
  console.log('Notificaciones filtradas:', notifications);

  // Marcar una notificación como leída
  const notificationId = notifications.data[0].id;
  const markReadResponse = await fetch(`${baseUrl}/notifications/${notificationId}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      isRead: true
    })
  });
  console.log('Notificación marcada como leída');

  // Marcar todas como leídas
  const markAllResponse = await fetch(`${baseUrl}/notifications/mark-all/read`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  console.log('Todas las notificaciones marcadas como leídas');
}

// ============================================
// EJEMPLO 3: Crear reto personalizado (Admin)
// ============================================

async function createCustomChallenge() {
  const token = 'admin-jwt-token';
  const baseUrl = 'http://localhost:3000';

  const challengeResponse = await fetch(`${baseUrl}/challenges`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      title: 'Desafío del Tricampeón',
      description: 'Recrea el gol más famoso de tu jugador favorito',
      difficulty: 'HARD',
      requiredActions: 1,
      rewards: {
        points: 1000,
        coins: 500,
        badge: 'tricampeon'
      },
      metadata: {
        category: 'recreacion',
        featured: true
      }
      // expiresAt se calculará automáticamente (14 días para HARD)
    })
  });

  const challenge = await challengeResponse.json();
  console.log('Reto creado:', challenge);
  // Automáticamente se notificará a todos los usuarios
}

// ============================================
// EJEMPLO 4: Revisar participaciones (Staff)
// ============================================

async function reviewSubmissions() {
  const token = 'staff-jwt-token';
  const baseUrl = 'http://localhost:3000';

  // Obtener participaciones de un reto
  const challengeId = 'uuid-del-reto';
  const submissionsResponse = await fetch(
    `${baseUrl}/challenges/${challengeId}/submissions`,
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );
  const submissions = await submissionsResponse.json();
  console.log('Participaciones:', submissions);

  // Aprobar una participación
  const submissionId = submissions[0].id;
  const approveResponse = await fetch(
    `${baseUrl}/challenges/submissions/${submissionId}`,
    {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        status: 'APPROVED',
        score: 95,
        feedback: '¡Increíble ejecución! Técnica perfecta.'
      })
    }
  );
  const approvedSubmission = await approveResponse.json();
  console.log('Participación aprobada:', approvedSubmission);
  // El usuario recibirá una notificación automáticamente

  // Rechazar una participación
  const rejectResponse = await fetch(
    `${baseUrl}/challenges/submissions/${submissionId}`,
    {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        status: 'REJECTED',
        feedback: 'El video no cumple con los requisitos del reto'
      })
    }
  );
  console.log('Participación rechazada');
}

// ============================================
// EJEMPLO 5: Ver mis participaciones
// ============================================

async function viewMySubmissions() {
  const token = 'your-jwt-token';
  const baseUrl = 'http://localhost:3000';

  const mySubmissionsResponse = await fetch(
    `${baseUrl}/challenges/submissions/my`,
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );
  const mySubmissions = await mySubmissionsResponse.json();

  console.log('Mis participaciones:', mySubmissions);

  // Filtrar por estado
  const pending = mySubmissions.filter(s => s.status === 'PENDING');
  const approved = mySubmissions.filter(s => s.status === 'APPROVED');
  const rejected = mySubmissions.filter(s => s.status === 'REJECTED');

  console.log('Pendientes:', pending.length);
  console.log('Aprobadas:', approved.length);
  console.log('Rechazadas:', rejected.length);
}

// ============================================
// EJEMPLO 6: Obtener detalles de un reto
// ============================================

async function getChallengeDetails() {
  const token = 'your-jwt-token';
  const baseUrl = 'http://localhost:3000';
  const challengeId = 'uuid-del-reto';

  const challengeResponse = await fetch(`${baseUrl}/challenges/${challengeId}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  const challenge = await challengeResponse.json();

  console.log('Detalles del reto:', {
    title: challenge.title,
    description: challenge.description,
    difficulty: challenge.difficulty,
    status: challenge.status,
    startDate: challenge.startDate,
    expiresAt: challenge.expiresAt,
    rewards: challenge.rewards,
    totalSubmissions: challenge._count.submissions,
    submissions: challenge.submissions
  });

  // Calcular tiempo restante
  const now = new Date();
  const expiresAt = new Date(challenge.expiresAt);
  const hoursRemaining = Math.floor((expiresAt - now) / (1000 * 60 * 60));
  console.log(`Tiempo restante: ${hoursRemaining} horas`);
}

// ============================================
// EJEMPLO 7: Filtrar retos por dificultad
// ============================================

async function filterChallengesByDifficulty() {
  const token = 'your-jwt-token';
  const baseUrl = 'http://localhost:3000';

  // Retos fáciles
  const easyResponse = await fetch(
    `${baseUrl}/challenges?difficulty=EASY&status=ACTIVE&page=1&limit=10`,
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );
  const easyChallenges = await easyResponse.json();
  console.log('Retos fáciles:', easyChallenges);

  // Retos extremos
  const extremeResponse = await fetch(
    `${baseUrl}/challenges?difficulty=EXTREME&status=ACTIVE`,
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );
  const extremeChallenges = await extremeResponse.json();
  console.log('Retos extremos:', extremeChallenges);
}

// ============================================
// EJEMPLO 8: Actualizar reto (Admin)
// ============================================

async function updateChallenge() {
  const token = 'admin-jwt-token';
  const baseUrl = 'http://localhost:3000';
  const challengeId = 'uuid-del-reto';

  const updateResponse = await fetch(`${baseUrl}/challenges/${challengeId}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      title: 'Nuevo Título del Reto',
      description: 'Descripción actualizada',
      rewards: {
        points: 1500,
        coins: 750,
        exclusive_badge: true
      },
      status: 'COMPLETED'
    })
  });

  const updatedChallenge = await updateResponse.json();
  console.log('Reto actualizado:', updatedChallenge);
}

// ============================================
// EJEMPLO 9: Integración con React/Vue/Angular
// ============================================

// React Hook Example
function useChallenges() {
  const [challenges, setChallenges] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchChallenges() {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/challenges/active', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setChallenges(data);
      setLoading(false);
    }
    fetchChallenges();
  }, []);

  return { challenges, loading };
}

// React Hook para notificaciones
function useNotifications() {
  const [notifications, setNotifications] = React.useState([]);
  const [unreadCount, setUnreadCount] = React.useState(0);

  React.useEffect(() => {
    const token = localStorage.getItem('token');

    // Cargar notificaciones
    fetch('http://localhost:3000/notifications', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setNotifications(data.data));

    // Cargar contador
    fetch('http://localhost:3000/notifications/unread-count', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setUnreadCount(data.count));

    // Actualizar cada 30 segundos
    const interval = setInterval(() => {
      fetch('http://localhost:3000/notifications/unread-count', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => setUnreadCount(data.count));
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return { notifications, unreadCount };
}

export {
  participateInChallenge,
  manageNotifications,
  createCustomChallenge,
  reviewSubmissions,
  viewMySubmissions,
  getChallengeDetails,
  filterChallengesByDifficulty,
  updateChallenge,
  useChallenges,
  useNotifications
};
