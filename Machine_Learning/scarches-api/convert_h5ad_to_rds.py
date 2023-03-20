import subprocess
import os 


def make_seurat(local_filename):
    """
    Create a Seurat rds file from the AnnData file.
    """
    try:
        subprocess.run(
            [
                "Rscript",
                os.path.join(os.path.abspath(os.path.dirname(__file__)), "sceasy_converter.R"),
                local_filename,
            ],
            capture_output=True,
            check=True,
        )
    except subprocess.CalledProcessError as ex:
        msg = f"Seurat conversion failed: {ex.output} {ex.stderr}"
        print(msg)
        raise RuntimeError(msg) from ex

    return local_filename.replace(".h5ad", ".rds")

if __name__ == "__main__":
    file_name = "test_1.h5ad"
    make_seurat(file_name)