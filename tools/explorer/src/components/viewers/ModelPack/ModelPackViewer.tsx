import './ModelPackViewer.css';

import { Engine } from '@babylonjs/core/Engines/engine';
import Grid from '@geist-ui/core/esm/grid/grid';
import GridContainer from '@geist-ui/core/esm/grid/grid-container';
import Table from '@geist-ui/core/esm/table/table';
import Text from '@geist-ui/core/esm/text/text';
import { AssetPackTable } from '@VCRE/components/Table/AssetPackTable';
import { ModelViewer, StaticModelViewer, StaticModelViewerProps } from '@VCRE/components/viewers';
import { ModelPack } from '@VCRE/core/gamedata';
import { useCallback, useMemo } from 'react';

export type ModelPackViewerProps = {
    modelPack: ModelPack;
    modelId?: number;
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

export function ModelPackViewer({ modelPack, modelId }: ModelPackViewerProps) {
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

    const viewerProvider = useCallback(() => {
        if (modelId === undefined) {
            return <></>;
        }

        const model = modelPack.getModel(modelId);
        if (!model) {
            return <></>;
        }

        return <ModelViewer model={model} />;
    }, [modelId, modelPack]);

    return <>
        <GridContainer gap={2}>
            <Grid xs={24} alignItems='center' direction='column'>
                <Text h3 margin={0}>{modelPack.name}</Text>
                <Text p small margin={0}>{modelPack.models.length} model(s)</Text>
            </Grid>
            <Grid xs={24} justify='center'>
                <AssetPackTable data={models} previewColIndex={2} selectedRowId={modelId} modalViewerProvider={viewerProvider}>
                    <Table.Column prop="id" label="id" />
                    <Table.Column prop="offset" label="offset" />
                    <Table.Column prop="view" label="preview" className='table-preview-cell' />
                    <Table.Column prop="vertexCount" label="# vertices" />
                    <Table.Column prop="faceCount" label="# faces" />
                    <Table.Column prop="depth" label="depth" />
                    <Table.Column prop="unk" label="unknown" />
                </AssetPackTable>
            </Grid>
        </GridContainer>
    </>;
}