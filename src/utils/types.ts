
// 添加方块状态枚举
export enum CellStateEnum {
	Hidden = 0,   // 未翻转
	Revealed = 1, // 已翻转
	Flagged = 2,  // 已标记
}

// 添加游戏状态枚举
export enum GameStateEnum {
	Ready = 0, // 未开始
	Playing = 1,    // 游戏中
	Won = 2,        // 成功
	Lost = 3,       // 失败
}