import React, { useState, useEffect } from "react";

function ServerBrowser(props) {
    let [servers, setServers] = useState(props.servers)
    useEffect(() => {
        console.log(servers.length)
    }, [servers])
    return (
        <ul className="servers-list">
            {servers.map(server => (
                <li className="server-item" key={server.id}>
                    {server}
                </li>
            ))}
        </ul>
    )
}

export default ServerBrowser