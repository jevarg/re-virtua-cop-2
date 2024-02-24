import { Grid } from '@geist-ui/core';
import { FileTree } from '../FileTree/FileTree';
import './Explorer.css';
import { TextureViewer } from '../viewer/TextureViewer';
import { useCallback, useState } from 'react';
import { TexturesFile } from '../../core/gamedata/Textures/TexturesFile';

export function Explorer() {
    const [textureFile, setTextureFile] = useState<TexturesFile>();

    const onClick = useCallback((item: TexturesFile) => {
        setTextureFile(item);
    }, []);

    return <Grid.Container>
        <Grid xs={6}>
            <aside className='sidebar'>
                <FileTree onClick={onClick} />
            </aside>
        </Grid>
        <Grid.Container justify='center' xs={18}>
            {textureFile && <TextureViewer textureFile={textureFile} />}
        </Grid.Container>
    </Grid.Container>;
}