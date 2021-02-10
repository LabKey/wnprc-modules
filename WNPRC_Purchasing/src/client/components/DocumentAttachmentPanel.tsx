import React, {FC, memo, useCallback} from 'react';
import {Panel} from 'react-bootstrap';
import { FileAttachmentForm } from '@labkey/components';
import {DocumentAttachmentModel} from "../model";
import { Map } from 'immutable';
import {Draft, produce} from "immer";

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

    const showImg = useCallback((evt: any) => {
        const attachment = model.savedFiles?.filter(file => file.fileName === evt.target.innerText)
        if (attachment) {
            const width = 400;
            const height = 400;
            const y = window.top.outerHeight / 2 + window.top.screenY - ( height / 2);
            const x = window.top.outerWidth / 2 + window.top.screenX - ( width / 2);
            window.open(attachment[0].href,'popwin','width=${width}, height=${height}, top=${y}, left=${x}');
        }
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
                    />
                    {
                        model.savedFiles?.length > 0 &&
                        <>
                        <br/>
                        <div className='saved-attachment-label'>
                            <strong>Saved Attachments:</strong>
                        </div>
                        {
                            model.savedFiles?.map((savedFile, idx) => {
                                return <div>
                                            <a href="#" onClick={showImg}>{savedFile.fileName}</a>
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
