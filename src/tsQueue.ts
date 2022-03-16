/*
 * @Author: czm
 * @Date: 2022-03-16 11:02:07
 * @LastEditTime: 2022-03-16 11:15:51
 * @LastEditors: Please set LastEditors
 * @Description: 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 * @FilePath: \luatide\src\tsQueue.ts
 */


export class Queue {
	private items = new WeakMap();//WeakMap对象是密钥/值对的集合，其中密钥被弱引用。键必须是对象，值可以是任意值。
	
	constructor() {
		this.items.set(this, []);
	}

	enqueue(...element: any) {//向队列尾部添加一个（或多个）新的项
		let q = this.items.get(this);
		q.push(...element);
	}

	dequeue() {//移除队列的第一个（排在队列最前面的）项，并返回被移除的元素。
		let q = this.items.get(this);
		let r = q.shift();
		return r;
	}

	front() {//返回队列中第一个元素——最先被添加，也将是最先被移除的元素。队列不做任何变动（不移除元素，只返回元素信息）
		let q = this.items.get(this);
		return q[0];
	}

	isEmpty() {//如果队列中不包含任何元素，返回true，否则返回false。
		return this.items.get(this).length === 0;
	}

	size() {//返回队列包含的元素个数，与数组的length属性类似。
		let q = this.items.get(this);
		return q.length;
	}

	clear() {//清空队列里面的元素。
		this.items.set(this, []);
	}

	print() {//打印队列为String到控制台
		console.log(this.toString());
	}

	toString() {//输出队列以String模式。
		return this.items.get(this).toString();
	}
}