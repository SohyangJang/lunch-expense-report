import "./globals.css";import type {Metadata} from "next";
export const metadata:Metadata={title:"점심식사비 리포트",description:"구성원별 점심식사비 관리 웹앱"};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="ko"><body>{children}</body></html>}