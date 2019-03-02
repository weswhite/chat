import React, { useState } from "react";

function ServerBrowser(props) {
    let [servers, setServers] = useState(props.servers)
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