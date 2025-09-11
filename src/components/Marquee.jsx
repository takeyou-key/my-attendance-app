import ReactMarquee from "react-fast-marquee";

/**
 * テロップ表示コンポーネント
 * react-fast-marqueeを使用してスクロールテキストを表示
 */
export default function Marquee() {
    return (
        <div>
            <ReactMarquee speed={60} style={{fontWeight: 'bold' }}>
                <span style={{color: 'red'}}>①変更したい日にちの項目欄（出勤・退勤・休憩）をダブルクリックして下さい。　</span>
                <span style={{color: 'orange'}}>②変更したい時間を入力して下さい。　</span>
                <span style={{color: 'green'}}>③申請ボタンを押して下さい。　</span>
                
                
            </ReactMarquee>
        </div>
    );
}