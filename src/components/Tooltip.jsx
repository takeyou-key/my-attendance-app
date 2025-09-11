// Tippy.js
// → ツールチップ表示ライブラリ
// → 用途: ホバーやクリック時に説明や補足を表示する

import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';

export default function Tooltip() {
    return (
        <div>
            <Tippy content="変更したいセルをダブルクリックして下さい。">
                <button>セル編集方法</button>
            </Tippy>
        </div>
    );

}