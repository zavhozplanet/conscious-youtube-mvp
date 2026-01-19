import { useState, useEffect } from 'react';
import { ShieldCheck, ShieldAlert, Plus } from 'lucide-react';

const API_URL = 'http://localhost:8080'; // Update in Prod

const ParentDashboard = () => {
    const [channels, setChannels] = useState([]);
    const [newChannelUrl, setNewChannelUrl] = useState('');

    useEffect(() => {
        fetchChannels();
    }, []);

    const fetchChannels = () => {
        // In real app, authenticated request
        fetch(`${API_URL}/channels`)
            .then(res => res.json())
            .then(data => setChannels(data || []))
            .catch(console.error);
    };

    const handleBlock = (id) => {
        // Generates deep link
        window.open(`vnd.youtube://www.youtube.com/channel/${id}`, '_blank');
    };

    const handleVerify = async () => {
        if (!newChannelUrl) return;

        // Mock verification adding to DB for now
        // Extract ID from URL (simplified logic)
        const mockID = "UC" + Math.random().toString(36).substr(2, 9);

        try {
            await fetch(`${API_URL}/channels`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    channel_id: mockID,
                    title: `Channel from ${newChannelUrl}`,
                    added_by: 123456789
                })
            });
            setNewChannelUrl('');
            fetchChannels();
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className="p-4 space-y-6">
            <header>
                <h1 className="text-2xl font-bold">Parent Radar</h1>
                <p className="text-gray-500">Monitoring your child's digital diet</p>
            </header>

            {/* Whitelist Addition */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm">
                <h2 className="text-lg font-semibold mb-2">Add to Whitelist</h2>
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={newChannelUrl}
                        onChange={(e) => setNewChannelUrl(e.target.value)}
                        placeholder="Paste YouTube channel link..."
                        className="flex-1 p-2 bg-gray-100 dark:bg-gray-700 rounded-lg outline-none"
                    />
                    <button
                        onClick={handleVerify}
                        className="bg-blue-500 text-white p-2 rounded-lg"
                    >
                        <Plus size={24} />
                    </button>
                </div>
            </div>

            {/* Channel List */}
            <div className="space-y-3">
                <h2 className="text-lg font-semibold">Recent Activity</h2>
                {channels.map(channel => (
                    <div key={channel.channel_id} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm flex items-center justify-between">
                        <div>
                            <h3 className="font-medium">{channel.title}</h3>
                            <p className="text-xs text-gray-400">ID: {channel.channel_id}</p>
                        </div>
                        <div className="flex items-center gap-3">
                            {channel.status === 'approved' ? (
                                <ShieldCheck className="text-green-500" size={20} />
                            ) : (
                                <ShieldAlert className="text-red-500" size={20} />
                            )}
                            <button
                                onClick={() => handleBlock(channel.channel_id)}
                                className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded"
                            >
                                Block
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ParentDashboard;
