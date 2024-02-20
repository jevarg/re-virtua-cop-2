import { Grid } from '@geist-ui/core';
import { FileTree } from '../FileTree/FileTree';
import './Explorer.css';
import { TextureViewer } from '../viewer/TextureViewer';
import { useCallback, useState } from 'react';
import { Texture } from '../../core/gamedata/Textures/Texture';

export function Explorer() {
    const [texture, setTexture] = useState<Texture>();

    const onClick = useCallback((item: Texture) => {
        setTexture(item);
    }, []);

    return <Grid.Container>
        <Grid xs={6}>
            <aside className='sidebar'>
                <FileTree onClick={onClick} />
            </aside>
        </Grid>
        <Grid.Container justify='center' xs>
            {texture && <TextureViewer texture={texture} />}
        </Grid.Container>
    </Grid.Container>;
}