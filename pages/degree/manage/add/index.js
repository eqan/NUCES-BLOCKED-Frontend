import React, { useState, useEffect, useRef } from 'react';
import { ProgressBar } from 'primereact/progressbar';
import { Toast } from 'primereact/toast';

const MiscDemo = () => {
    const [value, setValue] = useState(0);
    const toast = useRef(null);
    const interval = useRef(null);

    useEffect(() => {
        let val = value;
        interval.current = setInterval(() => {
            val += Math.floor(Math.random() * 50) + 1;

            if (val >= 100) {
                val = 100;
                toast.current.show({ severity: 'info', summary: 'Success', detail: 'Process Completed' });
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
        <div>
            <Toast ref={toast}></Toast>

            <div className="card">
                <h5>Collecting Data and Self-Generating Certifcate</h5>
                <ProgressBar style={{height:20}} value={value}></ProgressBar>
                </div>
            </div>
    );
};

export default MiscDemo;
