const { CommandInteraction, Client, MessageEmbed, Permissions } = require("discord.js");
const fs = require("fs");

module.exports = {
  name: "minesweeperboard",
  description: "Create a Minesweeper board!",
  options: [
    {
      name: "rows",
      description: "The number of rows in the Minesweeper board.",
      type: "INTEGER",
      required: true,
    },
    {
      name: "columns",
      description: "The number of columns in the Minesweeper board.",
      type: "INTEGER",
      required: true,
    },
    {
      name: "mines",
      description: "The number of mines in the Minesweeper board.",
      type: "INTEGER",
      required: true,
    },
    {
      name: "showboard",
      description: "Display the Minesweeper board with all the tiles revealed.",
      type: "BOOLEAN",
      required: false,
    }
  ],
  /**
   * @param {Client} client
   * @param {CommandInteraction} interaction
   */
  run: async (client, interaction) => {
    // Check permissions
    const error2Embed = {
      color: client.config.embedColorError,
      title: "Error",
      description: "Missing Permissions",
    };
    if (
      !interaction.member.permissions.has(Permissions.FLAGS.MANAGE_CHANNELS) ||
      !interaction.member.id == "777694273319469057"
    ) {
      //https://replit.com/talk/learn/Discord-Permissions-List-Array-form/35372
      interaction.followUp({ embeds: [error2Embed] });
      return;
    }

    const rows = interaction.options.getInteger("rows");
    const columns = interaction.options.getInteger("columns");
    const mines = interaction.options.getInteger("mines");
    const showboard = interaction.options.getBoolean("showboard");

    if (rows > 9 || columns > 9) {
      const embed = new MessageEmbed()
        .setTitle("Minesweeper")
        .setDescription("The maximum rows and columns you can have is 10.")
        .setColor("RED");
      return interaction.followUp({ embeds: [embed] });
    }

    if (mines > rows * columns) {
      const embed = new MessageEmbed()
        .setTitle("Minesweeper")
        .setDescription("The number of mines cannot exceed the number of tiles.")
        .setColor("RED");
      return interaction.followUp({ embeds: [embed] });
    }

    const minesweeper = new Minesweeper(rows, columns, mines, showboard);
    const matrix = minesweeper.start();

    const embed = new MessageEmbed()
      .setTitle("Minesweeper")
      .setDescription(matrix)
      .setColor(client.config.embedColorSuccess);
    return interaction.followUp({ embeds: [embed] });
  },
};

class Minesweeper {
  constructor(rows, columns, mines, showboard) {
    this.rows = rows;
    this.columns = columns;
    this.mines = mines;
    this.showboard = showboard;
    this.matrix = [];
  }

  start() {
    this.createMatrix(this.showboard);
    this.placeMines(this.showboard);
    this.calculateNumbers(this.showboard);
    return this.matrix.map((row) => row.join("")).join("\n");
  }

  createMatrix(showboard) {
    if (showboard) {
      for (let i = 0; i < this.rows; i++) {
        this.matrix.push(
          new Array(this.columns).fill(":black_large_square:")
        );
      }
      return;
    }
    for (let i = 0; i < this.rows; i++) {
      this.matrix.push(
        new Array(this.columns).fill("||:black_large_square:||")
      );
    }
  }

  placeMines(showboard) {
    let minesPlaced = 0;
    while (minesPlaced < this.mines) {
      const randomRow = Math.floor(Math.random() * this.rows);
      const randomColumn = Math.floor(Math.random() * this.columns);
      if (this.matrix[randomRow][randomColumn] === "||:black_large_square:||" && !showboard) {
        this.matrix[randomRow][randomColumn] = "||:bomb:||";
        minesPlaced++;
      } else if (this.matrix[randomRow][randomColumn] === ":black_large_square:" && showboard) {
        this.matrix[randomRow][randomColumn] = ":bomb:";
        minesPlaced++;
      }
    }
  }

  calculateNumbers(showboard) {
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.columns; j++) {
        if (this.matrix[i][j] === "||:bomb:||" && !showboard) {
          continue;
        } else if (this.matrix[i][j] === ":bomb:" && showboard) {
          continue;
        }

        let count = 0;
        const directions = [
          [-1, -1],
          [-1, 0],
          [-1, 1],
          [0, -1],
          [0, 1],
          [1, -1],
          [1, 0],
          [1, 1],
        ];

        for (const [x, y] of directions) {
          const newI = i + x;
          const newJ = j + y;
          if (
            newI >= 0 &&
            newI < this.rows &&
            newJ >= 0 &&
            newJ < this.columns
          ) {
            if (this.matrix[newI][newJ] === "||:bomb:||" && !showboard) {
              count++;
            } else if (this.matrix[newI][newJ] === ":bomb:" && showboard) {
              count++;
            }
          }
        }

        const numberToWord = {
          0: 'zero',
          1: 'one',
          2: 'two',
          3: 'three',
          4: 'four',
          5: 'five',
          6: 'six',
          7: 'seven',
          8: 'eight',
          9: 'nine'
        };

        if (count > 0 && !showboard) {
          this.matrix[i][j] = `||:${numberToWord[count]}:||`;
        } else if (count > 0 && showboard) {
          this.matrix[i][j] = `:${numberToWord[count]}:`;
        }
      }
    }
  }
}
