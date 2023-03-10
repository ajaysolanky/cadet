import json
import os

from langchain.text_splitter import NLTKTextSplitter, RecursiveCharacterTextSplitter

class GhettoDiskCache:
    def __init__(self):
        self.cache_dir = "./disk_cache_dir/"
    
    def get_key(self, *args):
        return ','.join(args)

    def get_cache_path(self, key):
        return self.cache_dir + f"{key}.json"

    def get_cache(self, key):
        if not os.path.isfile(self.get_cache_path(key)):
            return {}
        else:
            with open(self.get_cache_path(key), 'rb') as f:
                cache = json.load(f)
            return cache

    def check_cache(self, *args):
        key = self.get_key(*args)
        cache = self.get_cache(key)
        if key in cache:
            return cache[key]

    def save_to_cache(self, value, *args):
        key = self.get_key(*args)
        cache = self.get_cache(key)
        cache[key] = value
        with open(self.get_cache_path(key), 'w+') as f:
            json.dump(cache, f)

class CustomNLTKTextSplitter(NLTKTextSplitter):
    def __init__(self, **kwargs):
        super_keys = set(['chunk_size', 'chunk_overlap', 'length_function'])
        pass_up_args = {key: kwargs[key] for key in (super_keys & set(kwargs.keys()))}
        super().__init__(**pass_up_args)

    def split_text(self, text):
        splits = self._tokenizer(text)
        new_splits = []
        for split in splits:
            if len(split) <= self._chunk_size:
                new_splits.append(split)
                continue
            else:
                smaller_chunk_size = int(self._chunk_size / 3)
                overlap = int(smaller_chunk_size * .5)
                text_splitter = RecursiveCharacterTextSplitter(
                    chunk_size=int(self._chunk_size / 4),
                    chunk_overlap=overlap,
                    separators=["•","\n\n", "\n", " ", ""]
                    )
                sub_splits = text_splitter.split_text(split)
                new_splits.extend(sub_splits)
        return self._merge_splits(new_splits, self._separator)
