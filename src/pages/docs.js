import "swagger-ui/dist/swagger-ui.css";
import SwaggerUi from 'swagger-ui';
import config from 'src/lib/swaggerConfig.json';
import Head from 'next/head';

export default function Docs() {
    useEffect(() => {
        SwaggerUi({
            dom_id: '#swaggerContainer',
            spec: config,
        });
    }, []);

    return (
        <div>
            <Head>
                <title>API Documentation</title>
            </Head>
            <div id={'swaggerContainer'} />
        </div>
    );
}

import {useEffect} from 'react'
