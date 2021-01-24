import React, {FC, memo, useCallback} from 'react';
import {Panel} from 'react-bootstrap';
import { FileAttachmentForm } from '@labkey/components';
import {DocumentAttachmentModel} from "../model";
import { Map } from 'immutable';
import {Draft, produce} from "immer";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faTimesCircle} from "@fortawesome/free-solid-svg-icons";

interface Props
{
    model: DocumentAttachmentModel;
    onInputChange: (model: DocumentAttachmentModel) => void;
}

export const DocumentAttachmentPanel: FC<Props> = memo((props) => {

    const {model, onInputChange} = props;

    const onFileChange = useCallback((files: Map<string, File>) => {
        const updatedModel = produce(model, (draft: Draft<DocumentAttachmentModel>) => {
            draft['filesToUpload'] = files;
        });
        onInputChange(updatedModel);

    }, [model, onInputChange]);

    const onRemoveAttachment = useCallback((event: any) => {

    }, [model, onInputChange]);

    const onFileRemove = useCallback((attachmentName: string) => {

    }, [model, onInputChange]);

    return (
        <>
            <Panel
                className='panel panel-default'
                expanded={true}
                onToggle={function () {
                }} // this is added to suppress JS warning about providing an expanded prop without onToggle
            >
                <div className='bg-primary'>
                    <Panel.Heading>
                        <div className='panel-title'>Attachments</div>
                    </Panel.Heading>
                </div>
                <Panel.Body>
                    <FileAttachmentForm
                        allowDirectories={false}
                        allowMultiple={true}
                        showLabel={false}
                        acceptedFormats={".pdf, .PDF, .jpg, .JPG"}
                        onFileChange={onFileChange}
                        onFileRemoval={onFileRemove}
                    />
                    {
                        model.savedFiles?.length > 0 &&
                        <>
                        <br/>
                        <div className='saved-attachment-label'>
                            <strong>Saved Attachments:</strong>
                        </div>
                        {
                            model.savedFiles.map((savedFile, idx) => {
                                return <div>
                                            <span
                                                 id={'remove-saved-attachment-' + idx} title={'Remove saved attachment'} className="remove-saved-file-icon"
                                                 onClick={onRemoveAttachment}
                                            >
                                            <FontAwesomeIcon className='fa-faTimesCircle' icon={faTimesCircle}/>
                                            </span>
                                            {savedFile}
                                        </div>
                            })
                        }
                        </>
                    }
                </Panel.Body>
            </Panel>
        </>
    );
})
