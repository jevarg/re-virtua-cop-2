import './ModelPackViewer.css';

import { Engine } from '@babylonjs/core/Engines/engine';
import { Grid, Keyboard, Modal, Spacer, Table, Text } from '@geist-ui/core';
import X from '@geist-ui/icons/x';
import { Button, ModalAction } from '@VCRE/components/GeistFix';
import { ModelViewer, StaticModelViewer, StaticModelViewerProps } from '@VCRE/components/viewers';
import { ModelPack } from '@VCRE/core/gamedata';
import { useCallback, useMemo, useState } from 'react';

export type ModelPackViewerProps = {
    modelPack: ModelPack;
}

type ModelRow = {
    id: string;
    offset: string;
    view: React.ReactElement<StaticModelViewerProps>;
    vertexCount: number;
    faceCount: number;
    depth: string;
    unk: string;
}

// TODO: Move offscreenEngine somewhere else (react context?)
const offscreenEngine = createOffscreenEngine(128, 128);
function createOffscreenEngine(width: number, height: number) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    return new Engine(canvas.transferControlToOffscreen());
}

// This is the "PREVIEW" column index in the table.
const previewColIndex = 2;

export function ModelPackViewer({ modelPack }: ModelPackViewerProps) {
    const [ selectedModelId, setSelectedModelId ] = useState<number>();

    const models = useMemo(() => {
        const models: ModelRow[] = [];
        for (const model of modelPack.models) {
            models.push({
                id: model.id.toString(),
                offset: `0x${model.headerOffset.toString(16)}`,
                view: <StaticModelViewer engine={offscreenEngine} model={model} />,
                vertexCount: model.vertices.length,
                faceCount: model.faces.length,
                depth: `0x${model.depth.toString(16)}`,
                unk: `0x${model.unk.toString(16)}`,
            });
        }
        return models;
    }, [modelPack]);

    const onCellClicked = useCallback((_: ModelRow[keyof ModelRow], rowIndex: number, colIndex: number) => {
        console.log(`colIndex: ${colIndex}, rowIndex: ${rowIndex}`);
        if (colIndex !== previewColIndex) {
            return;
        }

        setSelectedModelId(rowIndex);
    }, []);

    const closeModal = useCallback(() => {
        setSelectedModelId(undefined);
    }, []);

    return <>
        <Grid.Container gap={2}>
            <Grid xs={24} alignItems='center' direction='column'>
                <Text h3 margin={0}>{modelPack.name}</Text>
                <Text p small margin={0}>{modelPack.models.length} model(s)</Text>
            </Grid>
            <Grid xs={24} justify='center'>
                <Table data={models} onCell={onCellClicked} className='model-pack-table'>
                    <Table.Column prop="id" label="id" />
                    <Table.Column prop="offset" label="offset" />
                    <Table.Column prop="view" label="preview" className='table-preview-cell' />
                    <Table.Column prop="vertexCount" label="# vertices" />
                    <Table.Column prop="faceCount" label="# faces" />
                    <Table.Column prop="depth" label="depth" />
                    <Table.Column prop="unk" label="unknown" />
                </Table>
            </Grid>
        </Grid.Container>

        <Modal width={3} className='modal-preview' visible={selectedModelId !== undefined} disableBackdropClick onClose={closeModal}>
            <Modal.Title>
                <Grid.Container justify='flex-end'>
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
                </Grid.Container>
            </Modal.Title>
            <Modal.Content>
                <ModelViewer model={modelPack.getModel(selectedModelId!)!} />
            </Modal.Content>
            <Modal.Action
                placeholder=''
                onPointerEnterCapture={undefined}
                onPointerLeaveCapture={undefined}
                passive
                onClick={e => e.close()}
            >
                Close
            </Modal.Action>
            {/* <Modal.Action placeholder="" onClick={GLTF2Export.GLBAsync()}>Close</Modal.Action> */}
        </Modal>
    </>;
}