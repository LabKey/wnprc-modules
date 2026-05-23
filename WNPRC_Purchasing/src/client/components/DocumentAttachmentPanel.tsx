/*
 * Copyright (c) 2021-2026 Board of Regents of the University of Wisconsin System
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import React, { FC, memo, useCallback } from 'react';
import { Panel } from 'react-bootstrap';
import { FileAttachmentForm } from '@labkey/components';

import { Map } from 'immutable';
import { produce, Draft } from 'immer';

import { DocumentAttachmentModel } from '../model';

interface Props {
    model: DocumentAttachmentModel;
    onInputChange: (model: DocumentAttachmentModel) => void;
    isReorder?: boolean;
}

export const DocumentAttachmentPanel: FC<Props> = memo(props => {
    const { model, onInputChange, isReorder } = props;

    const onFileChange = useCallback<any>(
        (files: Map<string, File>) => {
            const updatedModel = produce(model, (draft: Draft<DocumentAttachmentModel>) => {
                draft['filesToUpload'] = files as any;
            });
            onInputChange(updatedModel);
        },
        [model, onInputChange]
    );

    const showImg = useCallback(
        (evt: any) => {
            const attachment = model.savedFiles?.filter(file => file.fileName === evt.target.innerText);
            if (attachment) {
                window.open(attachment[0].href, 'popwin');
            }
        },
        [model, onInputChange]
    );

    return (
        <>
            <Panel
                className={'panel panel-default domain-form-panel'}
                expanded={true}
                onToggle={function () {}} // this is added to suppress JS warning about providing an expanded prop without onToggle
            >
                <div className="bg-primary">
                    <Panel.Heading>
                        <div className="panel-title">Attachments</div>
                    </Panel.Heading>
                </div>
                <Panel.Body>
                    <FileAttachmentForm
                        allowDirectories={false}
                        allowMultiple={true}
                        showLabel={false}
                        acceptedFormats=".pdf, .PDF, .jpg, .JPG"
                        onFileChange={onFileChange}
                    />
                    {(model.savedFiles?.length > 0 && !isReorder) && (
                        <>
                            <br />
                            <div className="saved-attachment-label">
                                <strong>Saved Attachments:</strong>
                            </div>
                            {model.savedFiles?.map(savedFile => {
                                return (
                                    <div>
                                        <a href="#" onClick={showImg}>
                                            {savedFile.fileName}
                                        </a>
                                    </div>
                                );
                            })}
                        </>
                    )}
                </Panel.Body>
            </Panel>
        </>
    );
});
