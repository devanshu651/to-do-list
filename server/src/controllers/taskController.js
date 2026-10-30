import Task from '../models/Task.js';
import ApiError from '../utils/ApiError.js';

const allowedSort = { dueDate: { dueDate: 1, createdAt: -1 }, createdAt: { createdAt: -1 }, priority: { priority: -1, createdAt: -1 }, title: { title: 1 } };

function queryFor(userId, query) {
  const filter = { user: userId };
  if (query.status) filter.status = query.status;
  if (query.priority) filter.priority = query.priority;
  if (query.category) filter.category = query.category;
  if (query.dueBefore || query.dueAfter) {
    filter.dueDate = {};
    if (query.dueBefore) filter.dueDate.$lte = new Date(query.dueBefore);
    if (query.dueAfter) filter.dueDate.$gte = new Date(query.dueAfter);
  }
  if (query.search) filter.$text = { $search: query.search };
  return filter;
}

export async function listTasks(req, res) {
  const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, Number.parseInt(req.query.limit, 10) || 10));
  const filter = queryFor(req.user.id, req.query);
  const [data, total] = await Promise.all([
    Task.find(filter).sort(allowedSort[req.query.sort] || allowedSort.dueDate).skip((page - 1) * limit).limit(limit),
    Task.countDocuments(filter),
  ]);
  res.json({ success: true, data, meta: { page, limit, total, pages: Math.ceil(total / limit) } });
}

export async function getTask(req, res) {
  const task = await Task.findOne({ _id: req.params.id, user: req.user.id });
  if (!task) throw new ApiError(404, 'TASK_NOT_FOUND', 'Task not found');
  res.json({ success: true, data: task });
}

export async function createTask(req, res) {
  const task = await Task.create({ ...req.body, user: req.user.id });
  res.status(201).json({ success: true, data: task });
}

export async function updateTask(req, res) {
  const task = await Task.findOneAndUpdate({ _id: req.params.id, user: req.user.id }, req.body, { new: true, runValidators: true });
  if (!task) throw new ApiError(404, 'TASK_NOT_FOUND', 'Task not found');
  res.json({ success: true, data: task });
}

export async function deleteTask(req, res) {
  const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user.id });
  if (!task) throw new ApiError(404, 'TASK_NOT_FOUND', 'Task not found');
  res.json({ success: true, data: { id: task.id } });
}
