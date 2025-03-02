// import { cookieStorage, createStorage, http } from '@wagmi/core'
import { ConnectButton } from "@/components/ConnectButton";
import { InfoList } from "@/components/InfoList";
import { ActionButtonList } from "@/components/ActionButtonList";
import { CodeDisplay } from "@/components/CodeDisplay";
import { frontendCode, contractCode } from "@/examples/codeExamples";

export default function Home() {

  return (
    <div className={"pages"}>
      {/* <Image src="/reown.svg" alt="Reown" width={150} height={150} priority /> */}
      <h1>HunYuan on-chain KYC integration demo</h1>

      <ConnectButton />
      <ActionButtonList />
      <InfoList />

      {/* Code Examples Section */}
      <div style={{ marginTop: '40px' }}>
        <div style={{ display: 'flex', flexDirection: 'row', gap: '20px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '300px' }}>
            <h3>Frontend Integration</h3>
            <CodeDisplay code={frontendCode} language="typescript" />
          </div>
          <div style={{ flex: 1, minWidth: '300px' }}>
            <h3>Smart Contract Integration</h3>
            <CodeDisplay code={contractCode} language="solidity" />
          </div>
        </div>
      </div>
    </div>
  );
}