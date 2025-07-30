from pydantic import BaseModel

# Note作成時に受け取るデータのベース
class NoteBase(BaseModel):
    id: str
    title: str
    content: str
    updated_at: float

# DBから読み取ったNoteデータを返すためのスキーマ
# from_attributes = True でORMモデルからPydanticモデルへ変換可能になる
class Note(NoteBase):
    class Config:
        from_attributes = True