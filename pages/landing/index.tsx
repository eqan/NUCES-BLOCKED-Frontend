import React, { } from 'react';
import getConfig from 'next/config';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';

const LandingPage = () => {
    const contextPath = getConfig().publicRuntimeConfig.contextPath;

    return (
        <div className="surface-0 flex justify-content-center">
            <div id="home" className="landing-wrapper overflow-hidden">
                

                <div
                    id="hero"
                    className="flex flex-column pt-4 px-4 lg:px-8 overflow-hidden"
                    style={{ background: 'linear-gradient(0deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.2)), radial-gradient(77.36% 256.97% at 77.36% 57.52%, #FFFFFF 5%, #515354 100%)', clipPath: 'ellipse(150% 87% at 93% 13%)' ,width:1640}}>
                    <div className="mx-4 md:mx-8 mt-0 md:mt-4">
                        <span className="text-6xl font-bold text-gray-900 line-height-2" >
                            <h1 style={{fontSize: 120, color:'##D7FCFF',margin:100,textAlign:'center'}}>NUCES BLOCKED</h1>
                        </span>
                    <div  style={{position:'absolute',left: 200,top: 420}}>
                    <div >
                            
                            <InputText type="text" placeholder="Enter Hash" className="w-full md:w-30rem mb-5" style={{ padding: '1rem' }} />

                          </div>
                        <div >
                            
                        <Button type="button" label="Download" className="p-button-rounded text-xl border-none mt-3 bg-blue-1000 font-normal line-height-3 px-3 text-white"></Button>
                       
                          </div>
                    </div> 
                    
                    
                    </div>    
                       
                    <div className="flex justify-content-center md:justify-content-end">
                        <img src={`${contextPath}/demo/images/landing/logo.png`} alt="Hero Image" className="w-9 md:w-auto" />
                    </div>
                   
                </div>

                <div>
                            
                </div>
            </div>
        </div>
    );
};

LandingPage.getLayout = function getLayout(page) {
    return (
        <React.Fragment>
            {page}
        </React.Fragment>
    );
};

export default LandingPage;
