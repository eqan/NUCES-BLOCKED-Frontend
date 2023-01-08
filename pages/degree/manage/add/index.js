import React, { useState, useEffect, useRef } from 'react';
import { ProgressBar } from 'primereact/progressbar';
import getConfig from 'next/config';

const MiscDemo = () => {
    const [value, setValue] = useState(0);
    const interval = useRef(null);
    const contextPath = getConfig().publicRuntimeConfig.contextPath;

    useEffect(() => {
        let val = value;
        interval.current = setInterval(() => {
            val += Math.floor(Math.random() * 10) + 1;

            if (val >= 100) {
                val = 100;
                clearInterval(interval.current);
            }
            setValue(val);
        }, 2000);

        return () => {
            if (interval.current) {
                clearInterval(interval.current);
                interval.current = null;
            }
        };
    }, [value]);

    return (
        <div className="grid">
            <div className="col-12">
                <div className="card">
                    <h5>Generating new Academic Certificates</h5>
                    <div className="grid">
                        <div className="col">
                            <ProgressBar value={value} />
                        </div>
                        
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MiscDemo;
