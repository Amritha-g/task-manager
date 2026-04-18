from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app import models, schemas
from app.api.deps import get_db, get_current_user

router = APIRouter()

@router.post("/", response_model=schemas.TaskResponse, status_code=status.HTTP_201_CREATED)
def create_task(
    *,
    db: Session = Depends(get_db),
    task_in: schemas.TaskCreate,
    current_user: models.User = Depends(get_current_user)
):
    task = models.Task(**task_in.model_dump(), user_id=current_user.id)
    db.add(task)
    db.commit()
    db.refresh(task)
    return task

@router.get("/", response_model=schemas.PaginatedTasks)
def read_tasks(
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    completed: Optional[bool] = Query(None, description="Filter by completion status"),
    priority: Optional[str] = Query(None, description="Filter by priority (high, medium, low)"),
    current_user: models.User = Depends(get_current_user)
):
    skip = (page - 1) * limit
    query = db.query(models.Task).filter(models.Task.user_id == current_user.id)
    
    if completed is not None:
        query = query.filter(models.Task.completed == completed)
    if priority:
        query = query.filter(models.Task.priority == priority)
        
    total = query.count()
    tasks = query.offset(skip).limit(limit).all()
    
    return schemas.PaginatedTasks(
        total=total,
        page=page,
        limit=limit,
        tasks=tasks
    )

@router.get("/{id}", response_model=schemas.TaskResponse)
def read_task(
    *,
    db: Session = Depends(get_db),
    id: int,
    current_user: models.User = Depends(get_current_user)
):
    task = db.query(models.Task).filter(models.Task.id == id, models.Task.user_id == current_user.id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task

@router.put("/{id}", response_model=schemas.TaskResponse)
def update_task(
    *,
    db: Session = Depends(get_db),
    id: int,
    task_in: schemas.TaskUpdate,
    current_user: models.User = Depends(get_current_user)
):
    task = db.query(models.Task).filter(models.Task.id == id, models.Task.user_id == current_user.id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    update_data = task_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(task, field, value)
        
    db.add(task)
    db.commit()
    db.refresh(task)
    return task

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(
    *,
    db: Session = Depends(get_db),
    id: int,
    current_user: models.User = Depends(get_current_user)
):
    task = db.query(models.Task).filter(models.Task.id == id, models.Task.user_id == current_user.id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    db.delete(task)
    db.commit()
    return None
