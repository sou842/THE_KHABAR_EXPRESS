import React from 'react'
import { Settings2, Globe, Save } from 'lucide-react';
const Settings: React.FC = () => {
    return (
        (
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4">
                    <h2 className="text-2xl font-bold text-foreground">Site Settings</h2>
                </div>

                <div className="bg-card border border-border p-6 rounded-xl shadow-sm">
                    <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
                        <Settings2 className="w-5 h-5 text-primary" /> General Settings
                    </h3>

                    <div className="space-y-4 max-w-md">
                        <div>
                            <label className="block text-sm font-medium mb-1 text-foreground">
                                Site Title
                            </label>
                            <input
                                type="text"
                                defaultValue="Khabar - Latest News and Updates"
                                className="w-full px-3 py-2 border border-border bg-background text-sm rounded-md focus:outline-none focus:ring-1 focus:ring-primary transition-shadow"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1 text-foreground">
                                Site Description
                            </label>
                            <textarea
                                className="w-full px-3 py-2 border border-border bg-background text-sm rounded-md focus:outline-none focus:ring-1 focus:ring-primary transition-shadow"
                                rows={4}
                                defaultValue="Khabar is a modern news platform delivering timely, accurate, and comprehensive coverage of events and stories that matter."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1 text-foreground">
                                Footer Text
                            </label>
                            <input
                                type="text"
                                defaultValue="© 2025 Khabar. All rights reserved."
                                className="w-full px-3 py-2 border border-border bg-background text-sm rounded-md focus:outline-none focus:ring-1 focus:ring-primary transition-shadow"
                            />
                        </div>

                        <button className="px-5 py-2.5 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:bg-primary/90 transition-colors shadow-sm mt-2 flex items-center gap-2">
                            <Save className="w-4 h-4" /> Save Changes
                        </button>
                    </div>
                </div>

                <div className="bg-card border border-border p-6 rounded-xl shadow-sm">
                    <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
                        <Globe className="w-5 h-5 text-primary" /> SEO Settings
                    </h3>

                    <div className="space-y-4 max-w-md">
                        <div>
                            <label className="block text-sm font-medium mb-1 text-foreground">
                                Default Meta Title
                            </label>
                            <input
                                type="text"
                                defaultValue="Khabar - Breaking News, Analysis, and Updates"
                                className="w-full px-3 py-2 border border-border bg-background text-sm rounded-md focus:outline-none focus:ring-1 focus:ring-primary transition-shadow"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1 text-foreground">
                                Default Meta Description
                            </label>
                            <textarea
                                className="w-full px-3 py-2 border border-border bg-background text-sm rounded-md focus:outline-none focus:ring-1 focus:ring-primary transition-shadow"
                                rows={4}
                                defaultValue="Get the latest news, in-depth analysis, and comprehensive coverage of events from around the world at Khabar."
                            />
                        </div>

                        <button className="px-5 py-2.5 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:bg-primary/90 transition-colors shadow-sm mt-2 flex items-center gap-2">
                            <Save className="w-4 h-4" /> Save Changes
                        </button>
                    </div>
                </div>
            </div>
        )
    )
}

export default Settings;