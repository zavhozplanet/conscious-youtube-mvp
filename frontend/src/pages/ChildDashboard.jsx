import { useState, useEffect } from 'react';
import axios from 'axios';
import { Play, CheckCircle } from 'lucide-react';

const API_URL = 'http://localhost:8080'; // Update in Prod

const ChildDashboard = () => {
    const [tasks, setTasks] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        // Fetch tasks
        axios.get(`${API_URL}/tasks`)
            .then(res => setTasks(res.data))
            .catch(err => console.error("Error fetching tasks:", err));
    }, []);

    const handleFileChange = (e) => {
        if (e.target.files) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (taskId) => {
        if (!selectedFile) {
            alert("Please record/select a video or audio file first!");
            return;
        }

        setUploading(true);
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('task_id', taskId);
        formData.append('user_id', 123456789); // Hardcoded User ID for MVP

        try {
            await axios.post(`${API_URL}/submit`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            alert("Submission received! AI is verifying...");
            setSelectedFile(null);
        } catch (error) {
            console.error("Upload failed", error);
            alert("Upload failed.");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="p-4 space-y-6 pb-24">
            {/* Balance Card */}
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-3xl p-6 text-white shadow-lg shadow-yellow-500/30">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-yellow-100 font-semibold mb-1">My Balance</h2>
                        <div className="text-4xl font-extrabold flex items-center gap-2">
                            <span>120</span>
                            <span className="text-2xl opacity-80">🪙</span>
                        </div>
                    </div>
                    <div className="bg-white/20 p-3 rounded-full backdrop-blur-sm">
                        <CheckCircle size={32} />
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <h2 className="text-xl font-bold text-slate-800 px-1">Today's Missions</h2>

                {/* Upload Area */}
                <div className="card border-dashed border-2 border-blue-200 bg-blue-50/50">
                    <label className="block text-sm font-bold text-blue-600 mb-3 uppercase tracking-wider">
                        1. Record Answer
                    </label>
                    <input
                        type="file"
                        accept="audio/*,video/*"
                        onChange={handleFileChange}
                        className="block w-full text-sm text-slate-500
                            file:mr-4 file:py-3 file:px-6
                            file:rounded-xl file:border-0
                            file:text-sm file:font-bold
                            file:bg-blue-100 file:text-blue-700
                            hover:file:bg-blue-200
                            transition-colors cursor-pointer"
                    />
                </div>

                <div className="grid gap-4">
                    {tasks.map(task => (
                        <div key={task.id} className="card group hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="font-bold text-lg text-slate-800 leading-tight">{task.title}</h3>
                                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-bold">
                                    +{task.reward_amount}
                                </span>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => window.open(`https://youtube.com/watch?v=${task.video_id}`, '_blank')}
                                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-xl flex items-center justify-center gap-2 font-semibold transition-colors"
                                >
                                    <Play size={18} fill="currentColor" /> Watch
                                </button>
                                <button
                                    onClick={() => handleSubmit(task.id)}
                                    disabled={uploading}
                                    className={`flex-1 text-white py-3 rounded-xl flex items-center justify-center gap-2 font-bold shadow-lg shadow-blue-500/20 transition-all active:scale-95 ${uploading ? 'bg-slate-400' : 'bg-blue-500 hover:bg-blue-600'}`}
                                >
                                    {uploading ? 'Sending...' : 'Submit'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ChildDashboard;
