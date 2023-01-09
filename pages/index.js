import { Button } from 'primereact/button';
import { Menu } from 'primereact/menu';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { gql, useQuery } from "@apollo/client";
import client from "../apollo-client";
import { LayoutContext } from '../layout/context/layoutcontext';
import Link from 'next/link';

const lineData = {
    labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
    datasets: [
        {
            label: 'First Dataset',
            data: [65, 59, 80, 81, 56, 55, 40],
            fill: false,
            backgroundColor: '#2f4860',
            borderColor: '#2f4860',
            tension: 0.4
        },
        {
            label: 'Second Dataset',
            data: [28, 48, 40, 19, 86, 27, 90],
            fill: false,
            backgroundColor: '#00bb7e',
            borderColor: '#00bb7e',
            tension: 0.4
        }
    ]
};

export default function Dashboard(){
    // console.log('launches', launches)
    // const { loading, error, data } = useQuery(GET_DOGS);
    // console.log(data);
    const [products, setProducts] = useState(null);
    const menu1 = useRef(null);
    const menu2 = useRef(null);

    return (
        <div className="grid">
            <div className="col-12 lg:col-6 xl:col-3">
                <div className="card mb-0">
                    <div className="flex justify-content-between mb-3">
                        <div>
                            <span className="block text-500 font-medium mb-3">Users</span>
                            <div className="text-900 font-medium text-xl">152</div>
                        </div>
                        <div className="flex align-items-center justify-content-center bg-blue-100 border-round" style={{ width: '2.5rem', height: '2.5rem' }}>
                            <i className="pi pi-user text-blue-500 text-xl" />
                        </div>
                    </div>
                    <span className="text-green-500 font-medium">24 new </span>
                    <span className="text-500">since last week</span>
                </div>
            </div>
            <div className="col-12 lg:col-6 xl:col-3">
                <div className="card mb-0">
                    <div className="flex justify-content-between mb-3">
                        <div>
                            <span className="block text-500 font-medium mb-3">Students</span>
                            <div className="text-900 font-medium text-xl">1000</div>
                        </div>
                        <div className="flex align-items-center justify-content-center bg-orange-100 border-round" style={{ width: '2.5rem', height: '2.5rem' }}>
                            <i className="pi pi-users text-orange-500 text-xl" />
                        </div>
                    </div>
                    <span className="text-green-500 font-medium">52 new </span>
                    <span className="text-500">since last week</span>
                </div>
            </div>
            <div className="col-12 lg:col-6 xl:col-3">
                <div className="card mb-0">
                    <div className="flex justify-content-between mb-3">
                        <div>
                            <span className="block text-500 font-medium mb-3">Contributions</span>
                            <div className="text-900 font-medium text-xl">241</div>
                        </div>
                        <div className="flex align-items-center justify-content-center bg-cyan-100 border-round" style={{ width: '2.5rem', height: '2.5rem' }}>
                            <i className="pi pi-book text-cyan-500 text-xl" />
                        </div>
                    </div>
                    <span className="text-green-500 font-medium">10 new </span>
                    <span className="text-500">since last week</span>
                </div>
            </div>
            <div className="col-12 lg:col-6 xl:col-3">
                <div className="card mb-0">
                    <div className="flex justify-content-between mb-3">
                        <div>
                            <span className="block text-500 font-medium mb-3">Academic Certificates</span>
                            <div className="text-900 font-medium text-xl">500</div>
                        </div>
                        <div className="flex align-items-center justify-content-center bg-purple-100 border-round" style={{ width: '2.5rem', height: '2.5rem' }}>
                            <i className="pi pi-bookmark text-purple-500 text-xl" />
                        </div>
                    </div>
                    <span className="text-green-500 font-medium">85</span>
                    <span className="text-500"> recently generated</span>
                </div>
            </div>

            <div className="col-12 xl:col-6">
                
                <div className="card">
                    <div className="flex justify-content-between align-items-center mb-5">
                        <h5>Profile</h5>
                        <div>
                            <Button type="button" icon="pi pi-ellipsis-v" className="p-button-rounded p-button-text p-button-plain" onClick={(event) => menu1.current.toggle(event)} />
                            <Menu
                                ref={menu1}
                                popup
                                model={[
                                    { label: 'Edit Profile', icon: 'pi pi-fw pi-pencil' },
                                    
                                ]}
                            />
                        </div>
                    </div>
                    <ul className="list-none p-0 m-0">
                        <li className="flex flex-column md:flex-row md:align-items-center md:justify-content-between mb-4">
                            <div>
                                <span className="text-900 font-medium mr-2 mb-1 md:mb-0">Name</span>
                                <div className="mt-1 text-600">Admin</div>
                            </div>
                        </li>
                        <li className="flex flex-column md:flex-row md:align-items-center md:justify-content-between mb-4">
                            <div>
                                <span className="text-900 font-medium mr-2 mb-1 md:mb-0">Email</span>
                                <div className="mt-1 text-600">admin@gmail.com</div>
                            </div>
                            
                        </li>
                        
                    </ul>
                </div>
            </div>

            <div className="col-12 xl:col-6">
                

                <div className="card">
                    <div className="flex align-items-center justify-content-between mb-4">
                        <h5>History</h5>
                        <div>
                            <Button type="button" icon="pi pi-ellipsis-v" className="p-button-rounded p-button-text p-button-plain" onClick={(event) => menu2.current.toggle(event)} />
                            <Menu
                                ref={menu2}
                                popup
                                model={[
                                
                                    { label: 'Delete', icon: 'pi pi-fw pi-minus' }
                                ]}
                            />
                        </div>
                    </div>

                    <span className="block text-600 font-medium mb-3">TODAY</span>
                    <ul className="p-0 mx-0 mt-0 mb-4 list-none">
                        <li className="flex align-items-center py-2 border-bottom-1 surface-border">
                            
                            <span className="text-900 line-height-3">
                                You have added user <span className="text-blue-500">Ahmad</span>
                                </span>
                            
                        </li>
                        <li className="flex align-items-center py-2">
                            
                            <span className="text-700 line-height-3">
                                You have added <span className="text-blue-500 font-medium">20</span> students.
                            </span>
                        </li>
                    </ul>

                    <span className="block text-600 font-medium mb-3">YESTERDAY</span>
                    <ul className="p-0 m-0 list-none">
                        <li className="flex align-items-center py-2 border-bottom-1 surface-border">
                            
                            <span className="text-900 line-height-3">
                                Ali has added contribution of <span className="text-blue-500">19F-0200</span>
                                </span>
                            
                        </li>
                        <li className="flex align-items-center py-2 border-bottom-1 surface-border">
                             <span className="text-900 line-height-3">
                                You have deleted the student <span className="text-blue-500">19F-0220</span>
                            </span>
                        </li>
                    </ul>
                </div>
                
            </div>
        </div>
    );
};
