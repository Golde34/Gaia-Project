import asyncio


def log_background_task_error(task: asyncio.Task) -> None:
    try:
        task.result()
    except Exception as exc:
        print(f"Background task execution failed: {exc}")

def _log_background_task_error(task: asyncio.Task) -> None:
    try:
        task.result()
    except Exception as exc:
        print(f"Background task generate_calendar_schedule failed: {exc}")