import Image from 'next/image'
function Welcome() {
    return (
        <div className={"container"}>
            <div>
                <h1>Welcome</h1>
            </div>
            <div>
                <p>For now, this project has no front end. Explore the API at <span><a href={"/api/v1"}>/api/v1</a></span>.</p>
                <a href="https://github.com/sensor-network/open-data-portal">Source Code</a>
                <a href="/docs">API Docs</a>
            </div>
            <br/>
            <div>
                <Image src={"/bth.png"} width={400} height={400}/>
            </div>
        </div>
    );
}

export default Welcome;