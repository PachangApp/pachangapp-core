import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { API_BASE_URL } from '../apiConfig';
import Navbar from "../components/Navbar";
import TournamentBracket from '../components/TournamentBracket';
import TournamentChat from '../components/TournamentChat';

const TorneoDetail = () => {
  const { id } = useParams();
  const [tournament, setTournament] = useState(null);
  const [teams, setTeams] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Para mockear un simple equipo para uniser
  const [joinName, setJoinName] = useState("");
  const [isJoining, setIsJoining] = useState(false);

  // Mock admin: En app real venir de store/auth
  const isAdmin = true;

  const loadData = async () => {
    try {
      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
      const headers = { 
        'Content-Type': 'application/json',
        ...(storedUser.token ? { 'Authorization': `Bearer ${storedUser.token}` } : {})
      };

      const [tRes, teamsRes, matchesRes] = await Promise.all([
        fetch(`${API_BASE_URL}/tournaments/${id}`, { headers }),
        fetch(`${API_BASE_URL}/tournaments/${id}/teams`, { headers }),
        fetch(`${API_BASE_URL}/tournaments/${id}/matches`, { headers })
      ]);
      
      if (tRes.ok) setTournament(await tRes.json());
      if (teamsRes.ok) setTeams(await teamsRes.json());
      if (matchesRes.ok) setMatches(await matchesRes.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleJoin = async () => {
    if(!joinName.trim()) return;
    setIsJoining(true);
    try {
      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
      const headers = { 
        'Content-Type': 'application/json',
        ...(storedUser.token ? { 'Authorization': `Bearer ${storedUser.token}` } : {})
      };

      const res = await fetch(`${API_BASE_URL}/tournaments/${id}/join`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ name: joinName })
      });
      if(res.ok) {
        setJoinName("");
        loadData(); // recargar
      } else {
        alert("Error al unirse. Verifica plazas o estado.");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsJoining(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50"><span className="loading loading-spinner loading-lg text-primary"></span></div>;
  }

  if (!tournament) return <div>Torneo no encontrado</div>;

  const isFull = teams.length >= tournament.maxTeams;

  return (
    <div className="min-h-screen bg-gray-50 pb-24 overflow-x-hidden text-gray-900">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 pt-8 space-y-8">
        
        {/* Header/Hero del torneo */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 flex flex-col md:flex-row relative"
        >
          <div className="md:w-1/3 h-64 md:h-auto relative">
            <img 
              src={tournament.imageUrl || "https://images.unsplash.com/photo-1579952363873-27f3bade9f55"} 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent md:bg-gradient-to-r" />
          </div>
          
          <div className="p-8 md:p-10 flex-1 relative z-10 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-4">
                <span className={`px-3 py-1 text-xs font-bold rounded-lg uppercase tracking-wider ${tournament.status === 'OPEN' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                  {tournament.status === 'OPEN' ? 'Inscripciones Abiertas' : 'En Curso'}
                </span>
                <span className="text-gray-500 text-sm font-bold">📍 {tournament.location}</span>
              </div>
              <h1 className="text-3xl md:text-5xl font-black text-gray-900 mb-4">{tournament.name}</h1>
              <p className="text-gray-600 mb-6">{tournament.description}</p>
            </div>
            
            <div className="flex flex-wrap gap-4 items-center">
              <div className="bg-gray-50 px-4 py-2 rounded-xl">
                <span className="block text-xs text-gray-500 uppercase font-bold">Equipos Info</span>
                <span className="font-mono text-lg font-bold text-gray-800">{teams.length} / {tournament.maxTeams}</span>
              </div>
              <div className="bg-gray-50 px-4 py-2 rounded-xl">
                <span className="block text-xs text-gray-500 uppercase font-bold">Premio</span>
                <span className="text-lg font-bold text-yellow-600">{tournament.prize}</span>
              </div>

              {tournament.status === 'OPEN' && !isFull && (
                <div className="ml-auto w-full md:w-auto flex flex-col sm:flex-row gap-2 mt-4 md:mt-0">
                  <input 
                    type="text" 
                    placeholder="Nombre del equipo" 
                    value={joinName}
                    onChange={(e) => setJoinName(e.target.value)}
                    className="bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-2 text-sm focus:outline-none placeholder-gray-400"
                  />
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleJoin}
                    disabled={isJoining}
                    className="bg-primary text-white font-bold px-6 py-2 rounded-xl shadow-lg hover:shadow-primary/30"
                  >
                    Unirse
                  </motion.button>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 space-y-8">
            {/* BRACKET */}
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
              className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100"
            >
              <h2 className="text-2xl font-black mb-6 text-gray-900">🏆 Bracket Oficial</h2>
              <div className="overflow-x-auto">
                <TournamentBracket matches={matches} isAdmin={isAdmin} onMatchUpdate={loadData} />
              </div>
            </motion.div>
          </div>

          <div className="space-y-8">
            {/* EQUIPOS */}
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
              className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100"
            >
              <h2 className="text-xl font-bold mb-4 text-gray-900">Equipos ({teams.length})</h2>
              <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                {teams.length === 0 ? <p className="text-sm text-gray-400">Nadie inscrito aún.</p> : teams.map((team, i) => (
                  <div key={i} className="flex items-center gap-3 bg-gray-50 p-2 rounded-xl border border-gray-100">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs">
                      {i+1}
                    </div>
                    <span className="font-semibold text-gray-700">{team.name}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* CHAT */}
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
            >
               <TournamentChat tournamentId={id} />
            </motion.div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default TorneoDetail;
