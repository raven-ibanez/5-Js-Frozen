import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { SiteSettings } from '../types';

const DEFAULT_SETTINGS: SiteSettings = {
    site_name: '5J\'s Frozen',
    site_logo: '',
    site_description: 'Premium Meat Shop',
    currency: 'PHP',
    currency_code: 'PHP',
    store_lat: 14.5995, // Manila default
    store_lng: 120.9842,
    delivery_rate_base: 50,
    delivery_rate_per_km: 15
};

export const useSettings = () => {
    const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('site_settings')
                .select('*');

            if (error) throw error;

            if (data) {
                const newSettings = { ...DEFAULT_SETTINGS };
                data.forEach(setting => {
                    if (setting.value) {
                        // Parse numbers for specific fields
                        if (['store_lat', 'store_lng', 'delivery_rate_base', 'delivery_rate_per_km'].includes(setting.id)) {
                            const val = parseFloat(setting.value);
                            if (!isNaN(val)) {
                                // @ts-ignore
                                newSettings[setting.id as keyof SiteSettings] = val;
                            }
                        } else {
                            // @ts-ignore
                            newSettings[setting.id as keyof SiteSettings] = setting.value;
                        }
                    }
                });
                setSettings(newSettings);
            }
        } catch (err) {
            console.error('Error fetching settings:', err);
            setError('Failed to fetch settings');
        } finally {
            setLoading(false);
        }
    };

    const updateSetting = async (key: keyof SiteSettings, value: string | number) => {
        try {
            // Optimistic update
            setSettings(prev => ({ ...prev, [key]: value }));

            const { error } = await supabase
                .from('site_settings')
                .upsert({
                    id: key,
                    value: value.toString(),
                    type: typeof value === 'number' ? 'number' : 'text',
                    updated_at: new Date().toISOString()
                });

            if (error) throw error;
        } catch (err) {
            console.error('Error updating setting:', err);
            setError('Failed to update setting');
            // Revert on error
            fetchSettings();
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    return {
        settings,
        loading,
        error,
        updateSetting,
        refetch: fetchSettings
    };
};
