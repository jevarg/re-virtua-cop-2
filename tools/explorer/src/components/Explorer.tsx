import { Grid, Page } from '@geist-ui/core';
import { FileTree } from './FileTree';
import './Explorer.css';

export function Explorer() {
    return (
        <Page>
            <Grid.Container>
                <Grid xs={5}>
                    <aside className='sidebar'>
                        <FileTree />
                    </aside>
                </Grid>

            </Grid.Container>
        </Page>
    );
}