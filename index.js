const LineByLineReader = require('line-by-line')

const lr = new LineByLineReader('./clues.tsv', {end: 50000000})

const data = []

lr.on('error', function (err) {
	// 'err' contains error object
    console.log(err)
});

lr.on('line', function (line) {
	// 'line' contains the current line without the trailing newline character.
    const [pubid, year, word, clue] = line.split('\t')
    data.push({word, clue})
});

lr.on('end', function () {
	// All lines are read, file is closed now.
    console.log('reading complete')
    data.pop()
    console.log(makeCrossword(6))
});

function makeCrossword(size) {
    const clues = []
    const crossword = Array.apply(null, Array(size)).map(() => Array(size).fill('.'))
    for(let i = 0; i < size; i++) {
        let answer = fillCrosswordAt(crossword, 0, i, true)
        if (answer) {
            clues.push({x: 0, y: i, clue: answer.clue, answer: answer.word, isHorizontal: true})
        }
        answer = fillCrosswordAt(crossword, i, 0, false)
        if (answer) {
            clues.push({x: i, y: 0, clue: answer.clue, answer: answer.word, isHorizontal: false})
        }
    }

    // TODO: iterate on the matrix and try to fill words in #s

    return {crossword, clues}
}

function fillCrosswordAt(crossword, x, y, isHorizontal) {
    const constraint = makeConstraint(crossword, x, y, isHorizontal)
    const word = getRandomWord(constraint)
    if (word) {
        console.log(word)
        fillWord(crossword, word.word, x, y, isHorizontal)
        return word
    }
}

function getRandomWord(constraint) {
    const candidates = chooseWords(constraint)
    const ret = candidates[Math.floor(Math.random() * candidates.length)]
    if (ret) ret.word += '#'
    return ret
}

function chooseWords(constraint) {
    return data.filter(({word, clue}) => {
        if (word.length + 1 > constraint.length || word.length === 0) return false
        for(let i = 0; i < word.length; i++) {
            if (constraint[i] !== '.' && constraint[i] !== word[i]) return false
        }
        return true
    })
}

function fillWord(crossword, word, x, y, isHorizontal) {
    for(let i = 0; i < word.length; i++) {
        if (isHorizontal) {
            crossword[y][x+i] = word[i]
        } else {
            crossword[y+i][x] = word[i]
        }
    }
}

function makeConstraint(crossword, x, y, isHorizontal) {
    if (isHorizontal) {
        return crossword[y].slice(x, crossword[y].indexOf('#', x)).join('')
    }
    let ret = ""
    for(let i = y; i < crossword.length; i++) {
        if (crossword[i][x] === '#') return ret
        ret += crossword[i][x]
    }
    return ret
}