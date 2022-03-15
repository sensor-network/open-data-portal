import Image from 'next/image'
function Welcome() {
    return (
        <div className={"container"}>
            <div>
                <h1>Welcome</h1>
            </div>
            <div>
                This application is a work in progress, including:

                    <p>A basic API</p>
                    <p>API Documentation</p>
                    <p>Data Grid for exploring data</p>
                    <p>Basic overview diagram of the data</p>

                Explore using the tabs in the navbar, and change the unit which the data is presented in using the preference modal.
            </div>
            <div>
                <Image src={"/bth.png"} width={400} height={400}/>
            </div>
        </div>
    );
}

export default Welcome;