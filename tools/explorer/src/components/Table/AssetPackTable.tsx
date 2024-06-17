import './AssetPackTable.css';

import Grid from '@geist-ui/core/esm/grid/grid';
import GridContainer from '@geist-ui/core/esm/grid/grid-container';
import Keyboard from '@geist-ui/core/esm/keyboard/keyboard';
import Modal from '@geist-ui/core/esm/modal/modal';
import ModalAction from '@geist-ui/core/esm/modal/modal-action';
import ModalContent from '@geist-ui/core/esm/modal/modal-content';
import ModalTitle from '@geist-ui/core/esm/modal/modal-title';
import { TableDataItemBase } from '@geist-ui/core/esm/table';
import Table from '@geist-ui/core/esm/table/table';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '../GeistFix';

export type AssetPackTableProps = {
    data: TableDataItemBase[];
    previewColIndex: number;
    selectedRowId?: number;
    modalViewerProvider: () => React.ReactNode;
}

export function AssetPackTable({ children, data, previewColIndex, selectedRowId, modalViewerProvider }: React.PropsWithChildren<AssetPackTableProps>) {
    const navigate = useNavigate();
    const onCell = useCallback((_: unknown, rowIndex: number, colIndex: number) => {
        if (colIndex !== previewColIndex || selectedRowId !== undefined) {
            return;
        }

        navigate(rowIndex.toString(), {relative: 'path'});
    }, [navigate, previewColIndex, selectedRowId]);

    const closeModal = useCallback(() => {
        if (selectedRowId === undefined) {
            return;
        }

        navigate('..', { relative: 'path' });
    }, [navigate, selectedRowId]);

    return <>
        <Table data={data} className='table-sticky' onCell={onCell}>
            { children }
        </Table>

        <Modal width={3} className='modal-preview' visible={selectedRowId !== undefined} disableBackdropClick onClose={closeModal}>
            <ModalTitle>
                <GridContainer justify='flex-end'>
                    <Grid>
                        <Button
                            className='modal-close'
                            icon={<Keyboard>Esc</Keyboard>}
                            auto
                            scale={1}
                            px={0.6}
                            onClick={closeModal}
                        />
                    </Grid>
                </GridContainer>
            </ModalTitle>
            <ModalContent>
                {modalViewerProvider()}
                {/* <ModelViewer model={modelPack.getModel(modelId!)!} /> */}
            </ModalContent>
            <ModalAction
                placeholder=''
                onPointerEnterCapture={undefined}
                onPointerLeaveCapture={undefined}
                passive
                onClick={closeModal}
            >
                Close
            </ModalAction>
        </Modal>
    </>;
}