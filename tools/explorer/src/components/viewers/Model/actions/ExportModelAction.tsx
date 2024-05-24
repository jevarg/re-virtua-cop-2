import ButtonDropdown from '@geist-ui/core/esm/button-dropdown/button-dropdown';
import ButtonDropdownItem from '@geist-ui/core/esm/button-dropdown/button-dropdown-item';
import Spacer from '@geist-ui/core/esm/spacer';
import Tooltip from '@geist-ui/core/esm/tooltip/tooltip';
import Download from '@geist-ui/icons/download';

import { ExportModelSupportedFormats } from './ExportModelSupportedFormats';

export type ExportModelActionProps = {
    onExport: (format: ExportModelSupportedFormats) => void;
};

export function ExportModelAction({ onExport }: ExportModelActionProps) {
    return (
        <Tooltip text='Export' scale={2 / 3}>
            <ButtonDropdown className='download-button' scale={2 / 3} auto>
                <ButtonDropdownItem main onClick={() => onExport(ExportModelSupportedFormats.GLB)}>
                    <Download size={16} />
                    <Spacer width={0.5} />
                    GLB
                </ButtonDropdownItem>
                <ButtonDropdownItem onClick={() => onExport(ExportModelSupportedFormats.GLTF)}>glTF</ButtonDropdownItem>
                <ButtonDropdownItem onClick={() => onExport(ExportModelSupportedFormats.OBJ)}>OBJ</ButtonDropdownItem>
            </ButtonDropdown>
        </Tooltip>
    );
}