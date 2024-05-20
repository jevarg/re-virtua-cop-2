import { ButtonDropdown, Spacer,Tooltip } from '@geist-ui/core';
import { Download } from '@geist-ui/icons';

import { ExportModelSupportedFormats } from './ExportModelSupportedFormats';

export type ExportModelActionProps = {
    onExport: (format: ExportModelSupportedFormats) => void;
};

export function ExportModelAction({ onExport }: ExportModelActionProps) {
    return (
        <Tooltip text='Export' scale={2 / 3}>
            <ButtonDropdown className='download-button' scale={2 / 3} auto>
                <ButtonDropdown.Item main onClick={() => onExport(ExportModelSupportedFormats.GLB)}>
                    <Download size={16} />
                    <Spacer width={0.5} />
                    GLB
                </ButtonDropdown.Item>
                <ButtonDropdown.Item onClick={() => onExport(ExportModelSupportedFormats.GLTF)}>glTF</ButtonDropdown.Item>
                <ButtonDropdown.Item onClick={() => onExport(ExportModelSupportedFormats.OBJ)}>OBJ</ButtonDropdown.Item>
            </ButtonDropdown>
        </Tooltip>
    );
}