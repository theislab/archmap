import os
import os.path
from os import path
import warnings
import numpy as np
import gdown
import getopt
import torch
import tempfile
import logging, sys
import argparse
import scanpy as sc
import scarches as sca
from scarches.dataset.trvae.data_handling import remove_sparsity
import matplotlib.pyplot as plt
import sys

sys.path.append('../utils/')
import utils

config = {}


def set_config(new_config):
    global config
    config = new_config


def get_from_config(key):
    return config[key]


# python3.9 scVI.py --input data/pancreas_normalized.h5ad -t -q


def setup():
    """
    Set up the warnings filter and the figure parameters
    :return:
    """
    warnings.simplefilter(action='ignore', category=FutureWarning)
    warnings.simplefilter(action='ignore', category=UserWarning)
    #  Set resolution/size, styling and format of figures.
    sc.settings.set_figure_params(dpi=200, frameon=False)
    # https://scanpy.readthedocs.io/en/stable/generated/scanpy.set_figure_params.html
    sc.set_figure_params(dpi=200, figsize=(4, 4))
    # https://pytorch.org/docs/stable/generated/torch.set_printoptions.html
    torch.set_printoptions(precision=3, sci_mode=False, edgeitems=7)


def pre_process_data():
    source_adata = sc.read(get_from_config('reference_dataset'))
    target_adata = sc.read(get_from_config('query_dataset'))
    source_adata = remove_sparsity(source_adata)
    target_adata = remove_sparsity(target_adata)

    return source_adata, target_adata


def create_scVI_model(source_adata, target_adata):
    """
    if there is already a pretrained model, nothing happens otherwise a new one will be trained
    :param source_adata:
    :param target_adata:
    :return:
    """
    if get_from_config('pre_trained_scVI'):
        return sca.models.SCVI.load_query_data(
            target_adata,
            get_from_config('model_path'),
            freeze_dropout=True,
        )
    else:
        setup_anndata(source_adata)
        vae = get_model(source_adata)
        vae.train(max_epochs=get_from_config('scvi_max_epochs'))
        compute_latent(vae, source_adata)
        vae.save(get_from_config('model_path'), overwrite=True)
        return vae


def setup_anndata(anndata):
    """
    Just because it's prettier that way
    :param anndata:
    :return:
    """
    sca.models.SCVI.setup_anndata(anndata, batch_key=get_from_config('condition_key'),
                                  labels_key=get_from_config('cell_type_key'))


def get_model(anndata):
    """
    Just because it's prettier that way
    :param anndata:
    :return:
    """
    return sca.models.SCVI(
        anndata,
        n_layers=get_from_config('n_layers'),
        encode_covariates=get_from_config('encode_covariates'),
        deeply_inject_covariates=get_from_config('deeply_inject_covariates'),
        use_layer_norm=get_from_config('use_layer_norm'),
        use_batch_norm=get_from_config('use_batch_norm'),
    )


def compute_latent(model, adata):
    """
    computes the latent of a model with specific adata
    :param model:
    :param adata:
    :return:
    """
    reference_latent = sc.AnnData(model.get_latent_representation(adata=adata))
    reference_latent.obs["cell_type"] = adata.obs[get_from_config('cell_type_key')].tolist()
    reference_latent.obs["batch"] = adata.obs[get_from_config('condition_key')].tolist()
    sc.pp.neighbors(reference_latent, n_neighbors=get_from_config('n_neighbors'))
    sc.tl.leiden(reference_latent)
    sc.tl.umap(reference_latent)
    sc.pl.umap(reference_latent,
               color=['batch', 'cell_type'],
               frameon=False,
               wspace=0.6,
               )

    return reference_latent


def compute_query(anndata):
    """
    trains the model on a query and saves the result
    :param anndata:
    :return:
    """
    model = sca.models.SCVI.load_query_data(anndata, get_from_config('model_path'), freeze_dropout=True)

    model.train(
        max_epochs=get_from_config('scvi_max_epochs'),
        plan_kwargs=dict(weight_decay=0.0),
        check_val_every_n_epoch=10,
    )
    query_latent = compute_latent(model, anndata)

    if get_from_config('debug'):
        utils.save_umap_as_pdf(query_latent, 'data/figures/query.pdf', color=['batch', 'cell_type'])

    query_path = get_from_config('generated_output_base_path') + 'query.tsv'
    utils.write_latent_csv(query_latent, filename=query_path)

    return model


def compute_full_latent(source_adata, target_adata, model):
    """
    basically just takes to datasets, concatenates them and then computes the latent and saves the result
    :param source_adata:
    :param target_adata:
    :param model:
    :return:
    """
    full_latent = compute_latent(model, source_adata.concatenate(target_adata))

    if get_from_config('debug'):
        utils.save_umap_as_pdf(full_latent, 'data/figures/both.pdf', color=['batch', 'cell_type'])

    both_path = get_from_config('generated_output_base_path') + 'both.tsv'
    utils.write_latent_csv(full_latent, filename=both_path)

    return full_latent


def compute_scVI(new_config):
    set_config(new_config)
    setup()
    source_adata, target_adata = pre_process_data()
    create_scVI_model(source_adata, target_adata)
    model = compute_query(target_adata)
    compute_full_latent(source_adata, target_adata, model)
    model.save(get_from_config('surgery_path'), overwrite=True)
