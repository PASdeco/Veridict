# v0.2.16
# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

from genlayer import *


class VerdictContract(gl.Contract):

    tasks: TreeMap[str, str]
    task_ids: DynArray[str]
    user_points: TreeMap[str, str]

    def __init__(self) -> None:
        pass

    @gl.public.view
    def get_points(self, wallet: str) -> int:
        pts = self.user_points[wallet] if wallet in self.user_points else "0"
        return int(pts)

    @gl.public.write
    def set_points(self, wallet: str, points: int) -> None:
        self.user_points[wallet] = str(points)
