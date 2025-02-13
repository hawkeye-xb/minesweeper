type Position = [number, number]; // [row, col]
type MineField = number[][];

interface GenerateOptions {
  rows: number;
  cols: number;
  mineCount: number;
  excludePositions?: Position[];  // 强制排除的位置
  includedMines?: Position[];     // 强制设置为地雷的位置
}

export class MineGenerator {
  private static readonly MINE = -1;
  private static readonly DIRECTIONS: Position[] = [
    [-1, -1], [-1, 0], [-1, 1],
    [0, -1],           [0, 1],
    [1, -1],  [1, 0],  [1, 1]
  ];

  /**
   * 生成地雷区域
   */
  static generate({
    rows,
    cols,
    mineCount,
    excludePositions = [],
    includedMines = []
  }: GenerateOptions): MineField {
    // 参数验证
    if (mineCount > rows * cols - excludePositions.length) {
      throw new Error('地雷数量超过可用格子数量');
    }

    // 初始化空矩阵
    const field = Array.from({ length: rows }, () => 
      Array(cols).fill(0)
    );

    // 处理强制地雷位置
    for (const [row, col] of includedMines) {
      if (this.isValidPosition(row, col, rows, cols)) {
        field[row][col] = this.MINE;
      }
    }

    // 计算还需要布置的地雷数量
    const remainingMines = mineCount - includedMines.length;

    // 创建可用位置列表
    const availablePositions = this.getAvailablePositions(
      rows,
      cols,
      excludePositions,
      includedMines
    );

    // 随机布置剩余地雷
    this.placeMinesRandomly(field, availablePositions, remainingMines);

    // 计算周围地雷数
    this.calculateNumbers(field);

    return field;
  }

  /**
   * 获取所有可用的位置
   */
  private static getAvailablePositions(
    rows: number,
    cols: number,
    excludePositions: Position[],
    includedMines: Position[]
  ): Position[] {
    const positions: Position[] = [];
    const excluded = new Set(
      [...excludePositions, ...includedMines]
        .map(([row, col]) => `${row},${col}`)
    );

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        if (!excluded.has(`${row},${col}`)) {
          positions.push([row, col]);
        }
      }
    }

    return positions;
  }

  /**
   * 随机布置地雷
   */
  private static placeMinesRandomly(
    field: MineField,
    positions: Position[],
    count: number
  ): void {
    // Fisher-Yates 洗牌算法
    for (let i = positions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [positions[i], positions[j]] = [positions[j], positions[i]];
    }

    // 放置地雷
    for (let i = 0; i < count; i++) {
      const [row, col] = positions[i];
      field[row][col] = this.MINE;
    }
  }

  /**
   * 计算每个格子周围的地雷数
   */
  private static calculateNumbers(field: MineField): void {
    const rows = field.length;
    const cols = field[0].length;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        if (field[row][col] === this.MINE) continue;

        let count = 0;
        for (const [dx, dy] of this.DIRECTIONS) {
          const newRow = row + dx;
          const newCol = col + dy;
          
          if (this.isValidPosition(newRow, newCol, rows, cols) && 
              field[newRow][newCol] === this.MINE) {
            count++;
          }
        }
        field[row][col] = count;
      }
    }
  }

  /**
   * 检查位置是否有效
   */
  private static isValidPosition(
    row: number,
    col: number,
    rows: number,
    cols: number
  ): boolean {
    return row >= 0 && row < rows && col >= 0 && col < cols;
  }
}