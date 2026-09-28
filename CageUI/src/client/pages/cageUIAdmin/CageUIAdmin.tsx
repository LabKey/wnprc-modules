/*
 *
 *  * Copyright (c) 2026 Board of Regents of the University of Wisconsin System
 *  *
 *  * Licensed under the Apache License, Version 2.0 (the "License");
 *  * you may not use this file except in compliance with the License.
 *  * You may obtain a copy of the License at
 *  *
 *  *     http://www.apache.org/licenses/LICENSE-2.0
 *  *
 *  * Unless required by applicable law or agreed to in writing, software
 *  * distributed under the License is distributed on an "AS IS" BASIS,
 *  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  * See the License for the specific language governing permissions and
 *  * limitations under the License.
 *
 */

import React, { FC, useEffect, useMemo, useState } from 'react';
import '../../cageui.scss';
import { getRecordDeleteSettings, setRecordDeleteSettings } from '../../api/labkeyActions';
import { LayoutErrors } from '../../components/LayoutErrors';
import { LoadingScreen } from '../../components/LoadingScreen';
import { ConfirmationPopup } from '../../components/ConfirmationPopup';

export interface AdminSettingItem {
    id: string;
    title: string;
    description: string;
    tag?: string;
    type: 'checkbox';
    value: boolean;
    onChange: (checked: boolean) => void;
}

export interface AdminSettingCategory {
    id: string;
    title: string;
    settings: AdminSettingItem[];
}

interface AdminSettingsState {
    recordCleanupEnabled: boolean;
}

export const CageUIAdmin: FC = () => {
    const [settings, setSettings] = useState<AdminSettingsState>({
        recordCleanupEnabled: false,
    });
    const [initialSettings, setInitialSettings] = useState<AdminSettingsState>({
        recordCleanupEnabled: false,
    });
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [errors, setErrors] = useState<string[]>([]);
    const [showSuccessPopup, setShowSuccessPopup] = useState<boolean>(false);

    useEffect(() => {
        setIsLoading(true);
        setErrors([]);

        getRecordDeleteSettings()
            .then((res) => {
                const fetchedState: AdminSettingsState = {
                    recordCleanupEnabled: !!res.enabled,
                };
                setSettings(fetchedState);
                setInitialSettings(fetchedState);
            })
            .catch((err: any) => {
                let errorList: string[] = ['Failed to load admin settings.'];
                if (err?.errors && Array.isArray(err.errors)) {
                    errorList = err.errors.map((e: any) => e.msg || e.message || String(e));
                } else if (err?.message) {
                    errorList = [err.message];
                }
                setErrors(errorList);
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, []);

    const hasUnsavedChanges = useMemo(() => {
        return settings.recordCleanupEnabled !== initialSettings.recordCleanupEnabled;
    }, [settings, initialSettings]);

    const handleReset = () => {
        setSettings(initialSettings);
        setErrors([]);
    };

    const handleSave = async () => {
        setIsSaving(true);
        setErrors([]);

        try {
            const res = await setRecordDeleteSettings(settings.recordCleanupEnabled);
            if (res.success) {
                setInitialSettings(settings);
                setShowSuccessPopup(true);
            } else {
                let errList: string[] = ['Failed to save settings.'];
                if (res.errors && Array.isArray(res.errors)) {
                    errList = res.errors.map((e: any) => e.msg || e.message || String(e));
                }
                setErrors(errList);
            }
        } catch (err: any) {
            let errList: string[] = ['An unexpected error occurred while saving settings.'];
            if (err?.errors && Array.isArray(err.errors)) {
                errList = err.errors.map((e: any) => e.msg || e.message || String(e));
            } else if (err?.message) {
                errList = [err.message];
            }
            setErrors(errList);
        } finally {
            setIsSaving(false);
        }
    };

    // Extensible settings registry configuration
    const settingCategories: AdminSettingCategory[] = useMemo(() => [
        {
            id: 'maintenance-automation',
            title: 'Automated Maintenance & Background Tasks',
            settings: [
                {
                    id: 'recordCleanupEnabled',
                    title: 'Record Cleanup Script',
                    tag: 'Daily Cron (23:30)',
                    description:
                        'Automatically purges incomplete, in-progress draft records (QCState 2) and orphaned modification/history records every day at 23:30. Helps maintain database integrity and optimal system performance.',
                    type: 'checkbox',
                    value: settings.recordCleanupEnabled,
                    onChange: (checked: boolean) =>
                        setSettings((prev) => ({ ...prev, recordCleanupEnabled: checked })),
                },
            ],
        },
    ], [settings]);

    return (
        <div className="cageui-admin-container" id="cageui-admin-root">
            <LoadingScreen
                isVisible={isLoading || isSaving}
                message={isLoading ? 'Loading Admin Settings...' : 'Saving Settings...'}
                targetElement={document.getElementById('cageui-admin-root')}
            />

            {errors.length > 0 && (
                <div className="admin-errors-container">
                    <LayoutErrors errors={errors} />
                </div>
            )}

            {settingCategories.map((category) => (
                <div key={category.id} className="cageui-admin-card">
                    <div className="card-header">
                        <h2>{category.title}</h2>
                    </div>
                    <div className="card-body">
                        <div className="admin-settings-list">
                            {category.settings.map((setting) => (
                                <div key={setting.id} className="admin-setting-item">
                                    <div className="admin-setting-info">
                                        <div className="setting-title-row">
                                            <span className="setting-title">{setting.title}</span>
                                            {setting.tag && <span className="setting-tag">{setting.tag}</span>}
                                        </div>
                                        <p className="setting-description">{setting.description}</p>
                                    </div>
                                    <div className="admin-setting-control">
                                        <span className={`control-status-label ${setting.value ? 'active' : ''}`}>
                                            {setting.value ? 'Enabled' : 'Disabled'}
                                        </span>
                                        <label
                                            className="switch-toggle"
                                            htmlFor={`setting-toggle-${setting.id}`}
                                            title={`Toggle ${setting.title}`}
                                        >
                                            <input
                                                id={`setting-toggle-${setting.id}`}
                                                type="checkbox"
                                                checked={setting.value}
                                                disabled={isLoading || isSaving}
                                                onChange={(e) => setting.onChange(e.target.checked)}
                                            />
                                            <span className="slider" />
                                        </label>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ))}

            <div className="admin-actions-bar">
                {hasUnsavedChanges ? (
                    <div className="unsaved-status">
                        <span className="status-dot" />
                        <span>You have unsaved changes</span>
                    </div>
                ) : (
                    <div />
                )}
                <div className="actions-group">
                    <button
                        type="button"
                        className="btn-reset-admin"
                        disabled={!hasUnsavedChanges || isLoading || isSaving}
                        onClick={handleReset}
                    >
                        Reset
                    </button>
                    <button
                        type="button"
                        className="btn-save-admin"
                        disabled={!hasUnsavedChanges || isLoading || isSaving}
                        onClick={handleSave}
                    >
                        {isSaving ? 'Saving...' : 'Save Settings'}
                    </button>
                </div>
            </div>

            {showSuccessPopup && (
                <ConfirmationPopup
                    message="Admin settings have been successfully saved.<br/><br/>Click Close to reload the page with updated settings."
                    onClose={() => {
                        setShowSuccessPopup(false);
                        window.location.reload();
                    }}
                />
            )}
        </div>
    );
};