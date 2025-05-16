import { SocketProvider } from "../../../context/socket.context";
import { WebRTCProvider } from "../../../context/webRtc.context";
export default function RootLayout({
    children,
  }: Readonly<{
    children: React.ReactNode;
  }>) {
    return (
          <SocketProvider>
            <WebRTCProvider>
            {children}
            </WebRTCProvider>
        </SocketProvider>
    );
  }