import subprocess
import os 


def make_anndata(local_filename):
    """
    Create a Anndata rds file from the Seurat file.
    """
    try:
        subprocess.run(
            [
                "Rscript",
                os.path.join(os.path.abspath(os.path.dirname(__file__)), "sceasy_converter_rds.R"),
                local_filename,
            ],
            capture_output=True,
            check=True,
        )
    except subprocess.CalledProcessError as ex:
        msg = f"Anndata conversion failed: {ex.output} {ex.stderr}"
        print(msg)
        raise RuntimeError(msg) from ex

    return local_filename.replace(".rds", ".h5ad")
