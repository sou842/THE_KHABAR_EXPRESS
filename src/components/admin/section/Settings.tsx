import React from 'react'

const Settings: React.FC = () => {
    return (
        (
            <div className="space-y-6">
                <h2 className="text-2xl font-medium">Site Settings</h2>

                <div className="bg-card p-6 rounded-xl shadow-sm">
                    <h3 className="text-lg font-medium mb-6">General Settings</h3>

                    <div className="space-y-4 max-w-md">
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Site Title
                            </label>
                            <input
                                type="text"
                                defaultValue="Khabar - Latest News and Updates"
                                className="w-full px-3 py-2 border rounded-md"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Site Description
                            </label>
                            <textarea
                                className="w-full px-3 py-2 border rounded-md"
                                rows={4}
                                defaultValue="Khabar is a modern news platform delivering timely, accurate, and comprehensive coverage of events and stories that matter."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Footer Text
                            </label>
                            <input
                                type="text"
                                defaultValue="© 2025 Khabar. All rights reserved."
                                className="w-full px-3 py-2 border rounded-md"
                            />
                        </div>

                        <button className="px-4 py-2 bg-khabar-600 text-white rounded-md hover:bg-khabar-700 transition-colors">
                            Save Changes
                        </button>
                    </div>
                </div>

                <div className="bg-card p-6 rounded-xl shadow-sm">
                    <h3 className="text-lg font-medium mb-6">SEO Settings</h3>

                    <div className="space-y-4 max-w-md">
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Default Meta Title
                            </label>
                            <input
                                type="text"
                                defaultValue="Khabar - Breaking News, Analysis, and Updates"
                                className="w-full px-3 py-2 border rounded-md"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Default Meta Description
                            </label>
                            <textarea
                                className="w-full px-3 py-2 border rounded-md"
                                rows={4}
                                defaultValue="Get the latest news, in-depth analysis, and comprehensive coverage of events from around the world at Khabar."
                            />
                        </div>

                        <button className="px-4 py-2 bg-khabar-600 text-white rounded-md hover:bg-khabar-700 transition-colors">
                            Save Changes
                        </button>
                    </div>
                </div>
            </div>
        )
    )
}

export default Settings;