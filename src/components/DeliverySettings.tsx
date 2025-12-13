import React from 'react';
import { useSettings } from '../hooks/useSettings';
import { LocationPicker } from './LocationPicker';

const DeliverySettings: React.FC = () => {
    const { settings, updateSetting, loading } = useSettings();

    if (loading) return <div>Loading settings...</div>;

    return (
        <div className="bg-white rounded-lg shadow-sm p-8 max-w-4xl mx-auto">
            <h3 className="text-xl font-bold font-playfair text-meat-dark mb-6">Delivery Settings</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <h4 className="font-medium text-black mb-4">Store Location</h4>
                    <p className="text-sm text-gray-600 mb-4">
                        Drag the pin to set your store's exact location. This will be used to calculate delivery distance.
                    </p>
                    <div className="rounded-lg overflow-hidden border border-gray-300">
                        <LocationPicker
                            initialLat={settings.store_lat}
                            initialLng={settings.store_lng}
                            onLocationSelect={(lat, lng) => {
                                updateSetting('store_lat', lat);
                                updateSetting('store_lng', lng);
                            }}
                        />
                    </div>
                </div>

                <div>
                    <h4 className="font-medium text-black mb-4">Delivery Rates (PHP)</h4>
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-black mb-2">Base Rate (First 1 km)</label>
                            <div className="relative">
                                <span className="absolute left-3 top-3 text-gray-500">₱</span>
                                <input
                                    type="number"
                                    value={settings.delivery_rate_base}
                                    onChange={(e) => updateSetting('delivery_rate_base', Number(e.target.value))}
                                    className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                                />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Flat rate for the first kilometer.</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-black mb-2">Succeeding Rate (per km)</label>
                            <div className="relative">
                                <span className="absolute left-3 top-3 text-gray-500">₱</span>
                                <input
                                    type="number"
                                    value={settings.delivery_rate_per_km}
                                    onChange={(e) => updateSetting('delivery_rate_per_km', Number(e.target.value))}
                                    className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                                />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Additional charge for every km after the first.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeliverySettings;
