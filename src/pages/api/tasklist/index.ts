import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/mongoose';
import { TaskList } from '@/models/tasklist.model';
import { sendTaskListCreatedEmail } from '@/lib/mailer';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;

  try {
    await dbConnect();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Database connection failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }

  switch (method) {
    case 'GET':
      try {
        const { latest, published } = req.query;
        let query = {};

        // Add published filter if specified
        if (published !== undefined) {
          query = { 'data.published': published === 'true' };
        }

        if (latest === 'true') {
          const latestTaskList = await TaskList.findOne(query)
            .sort({ createdAt: -1 })
            .limit(1);

          if (!latestTaskList) {
            return res.status(200).json({
              success: false,
              message: 'No task lists found',
              data: null
            });
          }

          return res.status(200).json({
            success: true,
            message: 'Latest task list retrieved successfully',
            data: latestTaskList
          });
        }

        // Regular GET all tasklists
        const tasklists = await TaskList.find(query).sort({ createdAt: -1 });

        if (!tasklists || tasklists.length === 0) {
          return res.status(200).json({
            success: false,
            message: 'No task lists found',
            data: []
          });
        }

        res.status(200).json({
          success: true,
          message: 'Task lists retrieved successfully',
          count: tasklists.length,
          data: tasklists
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          message: 'Error retrieving task lists',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
      break;

    case 'POST':
      try {
        // Validate request body
        if (!req.body || !req.body.data || !Array.isArray(req.body.data) || req.body.data.length === 0) {
          return res.status(400).json({
            success: false,
            message: 'Invalid request body. Data array is required and cannot be empty'
          });
        }

        if (!req.body.category) {
          return res.status(400).json({
            success: false,
            message: 'Category is required'
          });
        }

        // Set default published status if not provided
        const dataWithPublished = req.body.data.map((item: any) => ({
          ...item,
          published: item.published !== undefined ? item.published : false
        }));

        const taskList = await TaskList.create({
          ...req.body,
          data: dataWithPublished
        });
        
        // Send notification email (non-blocking)
        sendTaskListCreatedEmail(taskList).catch((emailError) => {
          // eslint-disable-next-line no-console
          console.error('Failed to send task list creation email:', emailError);
        });

        res.status(201).json({
          success: true,
          message: 'Task list created successfully',
          data: taskList
        });
      } catch (error) {
        // Handle specific MongoDB validation errors
        if (error instanceof Error && error.name === 'ValidationError') {
          return res.status(400).json({
            success: false,
            message: 'Validation error',
            error: error.message
          });
        }

        res.status(500).json({
          success: false,
          message: 'Error creating task list',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
      break;

    default:
      res.status(405).json({
        success: false,
        message: `Method ${method} not allowed`
      });
      break;
  }
}