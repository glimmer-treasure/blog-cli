import dayjs from 'dayjs'
import { Command } from 'commander';
import inquirer from 'inquirer';
import DatePrompt from "inquirer-date-prompt";
import fse from 'fs-extra'
import process from 'node:process'
import path from 'node:path'

inquirer.registerPrompt("date", DatePrompt);

const prompt = inquirer.createPromptModule();

/**
 * FrontMatter
 * @typedef {Map<string, string|Array<string>>} FrontMatter
 */

/**
 * 设置博客的标题
 * @param {FrontMatter} frontMatter 博客的封面
 */
const setTitle = async (frontMatter) => {
    const question = {
        name: 'title',
        message: '请输入博客标题:',
        type: 'input',
        validate(input) {
            if (['', null, undefined].includes(input)) {
                return '必须输入博客的标题：'
            }
            return true
        }
    }
    const answers = await prompt([question])
    frontMatter.set(question.name, answers[question.name])
}

/**
 * 设置博客的日期
 * @param {FrontMatter} frontMatter 博客的封面
 */
const setDate = async (frontMatter) => {
    const question = {
        name: 'date',
        message: '请输入博客创建的日期:',
        type: 'date',
        default: new Date(),
        clearable: true,
    }
    const answers = await prompt([question])
    const timestamp = answers[question.name] ?? Date.now()
    frontMatter.set(question.name, dayjs(timestamp).format('YYYY-MM-DD HH:mm:ss'))
}

/**
 * 设置博客的作者
 * @param {FrontMatter} frontMatter 博客的封面
 */
const setAuthor = async (frontMatter) => {
    const question = {
        name: 'author',
        message: '请输入博客作者:',
        type: 'input',
    }
    const answers = await prompt([question])
    if (answers[question.name]) {
        frontMatter.set(question.name, answers[question.name])
    }
}

/**
 * 设置博客的分类
 * @param {FrontMatter} frontMatter 博客的封面
 */
const setCategories = async (frontMatter) => {
    const question = {
        name: 'categories',
        message: '请输入博客的分类(以空格分隔):',
        type: 'input',
    }
    const answers = await prompt([question])
    const categories = answers[question.name].split(' ').filter((category) => !['', null, undefined].includes(category))
    frontMatter.set(question.name, [...new Set(categories)])
}

/**
 * 设置博客的标签
 * @param {FrontMatter} frontMatter 博客的封面
 */
const setTags = async (frontMatter) => {
    const question = {
        name: 'tags',
        message: '请输入博客的标签(以空格分隔):',
        type: 'input',
    }
    const answers = await prompt([question])
    const tags = answers[question.name].split(' ').filter((tag) => !['', null, undefined].includes(tag))
    frontMatter.set(question.name, [...new Set(tags)])
}

const getBlogFrontMatter = async () => {
    let frontMatter = new Map()
    await setTitle(frontMatter)
    await setDate(frontMatter)
    await setAuthor(frontMatter)
    await setCategories(frontMatter)
    await setTags(frontMatter)
    return frontMatter
}

const createBlog = async (blogDir, frontMatter) => {
    let blogPath = ''
    if (!blogDir) {
        blogPath = path.resolve(process.cwd(), `drafts/${frontMatter.get('title')}.md`)
    } else {
        blogPath = path.resolve(blogDir, `${frontMatter.get('title')}.md`)
    }
    const content = [...frontMatter.entries()].reduce((prev, entry) => {
        const [key, value] = entry
        if (!Array.isArray(value)) {
            prev += `${key}: ${value}\n`
        } else {
            prev += `${key}:\n`
            value.forEach((item) => {
                prev += `\t- ${item}\n`
            })
        }
        return prev
    }, '')
    await fse.outputFile(blogPath, `---\n${content}---\n`)
}

const getCommand = () => {
    const command =  new Command('add');
    command
    .argument('[path]', '添加博客的默认目录')
    .action(async (path) => {
        const frontMatter = await getBlogFrontMatter()
        await createBlog(path, frontMatter)
    })
    return command
}

export default getCommand