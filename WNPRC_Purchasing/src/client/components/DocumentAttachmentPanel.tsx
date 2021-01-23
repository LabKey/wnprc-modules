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
            draft['files'] = files;
        });
        onInputChange(updatedModel);

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
                </Panel.Body>
            </Panel>
        </>
    );
})
